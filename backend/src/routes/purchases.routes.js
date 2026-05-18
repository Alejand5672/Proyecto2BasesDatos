import { Router } from "express";
import { pool, query } from "../db.js";
import { asyncRoute, requireRole } from "../middleware.js";
import { sql } from "../queries.js";

export const purchaseRoutes = Router();

purchaseRoutes.get("/", asyncRoute(async (_req, res) => {
  res.json(await query(sql.purchases));
}));

purchaseRoutes.post("/", requireRole("administrador", "ventas"), asyncRoute(async (req, res) => {
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

    await client.query("update producto set stock = stock - $1 where id_producto = $2", [
      quantity,
      productId,
    ]);

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

purchaseRoutes.put("/:id", requireRole("administrador", "ventas"), asyncRoute(async (req, res) => {
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
      await client.query("update producto set stock = stock + $1 - $2 where id_producto = $3", [
        oldQuantity,
        newQuantity,
        newProductId,
      ]);
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

    await client.query("update compra set id_cliente = $1, id_empleado = $2 where id_compra = $3", [
      clientId,
      employeeId,
      req.params.id,
    ]);

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

purchaseRoutes.delete("/:id", requireRole("administrador", "ventas"), asyncRoute(async (req, res) => {
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
