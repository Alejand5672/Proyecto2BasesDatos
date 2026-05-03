import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, query } from "./db.js";
import { sql } from "./queries.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPath = path.join(__dirname, "..", "frontend");

app.use(cors());
app.use(express.json());
app.use(
  session({
    name: "proyecto2.sid",
    secret: process.env.SESSION_SECRET || "proyecto2-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);
app.use(express.static(frontendPath));

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
    return;
  }
  res.status(401).json({ message: "Debes iniciar sesion para continuar." });
}

app.get("/api/health", asyncRoute(async (_req, res) => {
  await query("select 1");
  res.json({ ok: true });
}));

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Ingresa usuario y contraseña." });
  }

  const rows = await query(
    `
      select id_usuario as id, nombre, usuario
      from app_usuario
      where usuario = $1 and password_hash = $2
    `,
    [username.trim(), hashPassword(password)]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Credenciales incorrectas." });
  }

  req.session.user = rows[0];
  res.json({ user: rows[0] });
}));

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("proyecto2.sid");
    res.json({ ok: true });
  });
});

app.use("/api", requireAuth);

app.get("/api/catalogs", asyncRoute(async (_req, res) => {
  const [categories, clients, employees] = await Promise.all([
    query(sql.categories),
    query(sql.clients),
    query(sql.employees),
  ]);
  res.json({ categories, clients, employees });
}));

app.get("/api/products", asyncRoute(async (_req, res) => {
  res.json(await query(sql.products));
}));

app.post("/api/products", asyncRoute(async (req, res) => {
  const { name, price, stock, categoryId } = req.body;
  if (!name || Number(price) <= 0 || Number(stock) < 0 || !categoryId) {
    return res.status(400).json({ message: "Datos invalidos para crear producto." });
  }

  const rows = await query(
    `
      insert into producto (id_producto, nombre, precio_base, stock, id_categoria)
      values ((select coalesce(max(id_producto), 0) + 1 from producto), $1, $2, $3, $4)
      returning id_producto as id
    `,
    [name.trim(), price, stock, categoryId]
  );
  res.status(201).json(rows[0]);
}));

app.put("/api/products/:id", asyncRoute(async (req, res) => {
  const { name, price, stock, categoryId } = req.body;
  if (!name || Number(price) <= 0 || Number(stock) < 0 || !categoryId) {
    return res.status(400).json({ message: "Datos invalidos para actualizar producto." });
  }

  await query(
    `
      update producto
      set nombre = $1, precio_base = $2, stock = $3, id_categoria = $4
      where id_producto = $5
    `,
    [name.trim(), price, stock, categoryId, req.params.id]
  );
  res.json({ ok: true });
}));

app.delete("/api/products/:id", asyncRoute(async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("delete from producto_proveedor where id_producto = $1", [req.params.id]);
    await client.query("delete from historial_stock where id_producto = $1", [req.params.id]);
    await client.query("delete from detalle_compra where id_producto = $1", [req.params.id]);
    await client.query("delete from producto where id_producto = $1", [req.params.id]);
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}));

app.get("/api/purchases", asyncRoute(async (_req, res) => {
  res.json(await query(sql.purchases));
}));

app.post("/api/purchases", asyncRoute(async (req, res) => {
  const { clientId, employeeId, productId, quantity, price } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "select stock from producto where id_producto = $1 for update",
      [productId]
    );

    if (productResult.rowCount === 0) {
      throw new Error("Producto no encontrado.");
    }

    if (Number(productResult.rows[0].stock) < Number(quantity)) {
      throw new Error("No hay stock suficiente para completar la compra.");
    }

    const purchaseResult = await client.query(
      `
        insert into compra (id_compra, fecha, id_cliente, id_empleado)
        values ((select coalesce(max(id_compra), 0) + 1 from compra), current_date, $1, $2)
        returning id_compra
      `,
      [clientId, employeeId]
    );

    const purchaseId = purchaseResult.rows[0].id_compra;

    await client.query(
      `
        insert into detalle_compra (id_detalle, cantidad, precio_venta, id_compra, id_producto)
        values ((select coalesce(max(id_detalle), 0) + 1 from detalle_compra), $1, $2, $3, $4)
      `,
      [quantity, price, purchaseId, productId]
    );

    await client.query(
      "update producto set stock = stock - $1 where id_producto = $2",
      [quantity, productId]
    );

    await client.query(
      `
        insert into historial_stock (id_historial, tipo_movimiento, cantidad, descripcion, fecha, id_producto)
        values ((select coalesce(max(id_historial), 0) + 1 from historial_stock), 'salida', $1, 'Venta registrada', current_date, $2)
      `,
      [quantity, productId]
    );

    await client.query("COMMIT");
    res.status(201).json({ id: purchaseId });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}));

app.put("/api/purchases/:id", asyncRoute(async (req, res) => {
  const { clientId, employeeId, productId, quantity, price } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      `
        select id_detalle, id_producto, cantidad
        from detalle_compra
        where id_compra = $1
        for update
      `,
      [req.params.id]
    );

    if (currentResult.rowCount === 0) {
      throw new Error("Compra no encontrada.");
    }

    const current = currentResult.rows[0];
    const oldProductId = Number(current.id_producto);
    const oldQuantity = Number(current.cantidad);
    const newProductId = Number(productId);
    const newQuantity = Number(quantity);

    if (oldProductId === newProductId) {
      const stockResult = await client.query(
        "select stock from producto where id_producto = $1 for update",
        [newProductId]
      );
      const availableAfterRestore = Number(stockResult.rows[0].stock) + oldQuantity;
      if (availableAfterRestore < newQuantity) {
        throw new Error("No hay stock suficiente para actualizar la compra.");
      }
      await client.query(
        "update producto set stock = stock + $1 - $2 where id_producto = $3",
        [oldQuantity, newQuantity, newProductId]
      );
    } else {
      await client.query("update producto set stock = stock + $1 where id_producto = $2", [
        oldQuantity,
        oldProductId,
      ]);

      const stockResult = await client.query(
        "select stock from producto where id_producto = $1 for update",
        [newProductId]
      );
      if (stockResult.rowCount === 0 || Number(stockResult.rows[0].stock) < newQuantity) {
        throw new Error("No hay stock suficiente para actualizar la compra.");
      }
      await client.query("update producto set stock = stock - $1 where id_producto = $2", [
        newQuantity,
        newProductId,
      ]);
    }

    await client.query(
      "update compra set id_cliente = $1, id_empleado = $2 where id_compra = $3",
      [clientId, employeeId, req.params.id]
    );

    await client.query(
      `
        update detalle_compra
        set cantidad = $1, precio_venta = $2, id_producto = $3
        where id_compra = $4
      `,
      [quantity, price, productId, req.params.id]
    );

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}));

app.delete("/api/purchases/:id", asyncRoute(async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const details = await client.query(
      "select id_producto, cantidad from detalle_compra where id_compra = $1 for update",
      [req.params.id]
    );

    for (const detail of details.rows) {
      await client.query("update producto set stock = stock + $1 where id_producto = $2", [
        detail.cantidad,
        detail.id_producto,
      ]);
    }

    await client.query("delete from detalle_compra where id_compra = $1", [req.params.id]);
    await client.query("delete from compra where id_compra = $1", [req.params.id]);

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}));

app.get("/api/dashboard", asyncRoute(async (_req, res) => {
  const [salesByCategory, lowStock, movements] = await Promise.all([
    query(sql.salesByCategory),
    query(sql.lowStock),
    query(sql.movements),
  ]);

  const totals = await query(`
    select
      (select count(*) from producto)::int as "productCount",
      (select count(*) from compra)::int as "purchaseCount",
      (select coalesce(sum(cantidad * precio_venta), 0) from detalle_compra)::float as "salesTotal",
      (select count(*) from producto where stock < 60)::int as "criticalStock"
  `);

  res.json({ ...totals[0], salesByCategory, lowStock, movements });
}));

app.get("/api/reports", asyncRoute(async (_req, res) => {
  const [topProducts, topClients] = await Promise.all([
    query(sql.topProductsFromView),
    query(sql.topClientsCte),
  ]);

  res.json({
    cards: [
      { title: "Productos mas vendidos", value: topProducts[0]?.producto || "Sin ventas", detail: "Producto lider por total vendido" },
      { title: "Mejores clientes", value: topClients[0]?.client || "Sin compras", detail: "Cliente con mayor consumo registrado" },
      { title: "Categorias destacadas", value: `${topProducts.length} activas`, detail: "Categorias con ventas registradas" },
      { title: "Inventario observado", value: "Stock actualizado", detail: "Compras descuentan unidades disponibles" },
    ],
    topProducts,
    topClients,
  });
}));

app.get("/api/suppliers", asyncRoute(async (_req, res) => {
  res.json(await query(sql.productSuppliers));
}));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Error interno del servidor." });
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
