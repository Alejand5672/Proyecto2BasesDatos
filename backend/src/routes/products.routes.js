import { Router } from "express";
import { pool, query } from "../db.js";
import { asyncRoute, requireRole } from "../middleware.js";
import { sql } from "../queries.js";

export const productRoutes = Router();

productRoutes.get("/", asyncRoute(async (_req, res) => {
  res.json(await query(sql.products));
}));

productRoutes.post("/", requireRole("administrador", "inventario"), asyncRoute(async (req, res) => {
  const { name, price, stock, categoryId, supplierId, buyPrice } = req.body;
  if (
    !name ||
    Number(price) <= 0 ||
    Number(stock) < 0 ||
    !categoryId ||
    !supplierId ||
    Number(buyPrice) <= 0
  ) {
    return res.status(400).json({ message: "Datos invalidos para crear producto." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rows = await client.query(
      `
        insert into producto (id_producto, nombre, precio_base, stock, id_categoria)
        values ((select coalesce(max(id_producto), 0) + 1 from producto), $1, $2, $3, $4)
        returning id_producto as id
      `,
      [name.trim(), price, stock, categoryId]
    );

    await client.query(
      `
        insert into producto_proveedor (id_producto, id_proveedor, precio_compra)
        values ($1, $2, $3)
      `,
      [rows.rows[0].id, supplierId, buyPrice]
    );

    await client.query("COMMIT");
    res.status(201).json(rows.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}));

productRoutes.put("/:id", requireRole("administrador", "inventario"), asyncRoute(async (req, res) => {
  const { name, price, stock, categoryId, supplierId, buyPrice } = req.body;
  if (
    !name ||
    Number(price) <= 0 ||
    Number(stock) < 0 ||
    !categoryId ||
    !supplierId ||
    Number(buyPrice) <= 0
  ) {
    return res.status(400).json({ message: "Datos invalidos para actualizar producto." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        update producto
        set nombre = $1, precio_base = $2, stock = $3, id_categoria = $4
        where id_producto = $5
      `,
      [name.trim(), price, stock, categoryId, req.params.id]
    );

    await client.query("update detalle_compra set precio_venta = $1 where id_producto = $2", [
      price,
      req.params.id,
    ]);

    await client.query("delete from producto_proveedor where id_producto = $1", [req.params.id]);

    await client.query(
      `
        insert into producto_proveedor (id_producto, id_proveedor, precio_compra)
        values ($1, $2, $3)
      `,
      [req.params.id, supplierId, buyPrice]
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

productRoutes.delete("/:id", requireRole("administrador", "inventario"), asyncRoute(async (req, res) => {
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
