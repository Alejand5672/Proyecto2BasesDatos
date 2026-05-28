import { Router } from "express";
import { pool, query } from "../db.js";
import { asyncRoute, requireRole } from "../middleware.js";
import { registerPurchaseWithProcedure, validatePurchaseStock } from "../procedures.js";
import { sql } from "../queries.js";

export const purchaseRoutes = Router();

purchaseRoutes.get("/", asyncRoute(async (_req, res) => {
  res.json(await query(sql.purchases));
}));

purchaseRoutes.post("/", requireRole("administrador", "ventas"), asyncRoute(async (req, res) => {
  const { clientId, employeeId, productId, quantity, price } = req.body;
  const stockValidation = await validatePurchaseStock(productId, quantity);

  if (!stockValidation.available) {
    const failedPurchase = await registerPurchaseWithProcedure({
      clientId,
      employeeId,
      productId,
      quantity,
      price,
    });
    return res.status(400).json({ message: failedPurchase.message || stockValidation.message });
  }

  const purchase = await registerPurchaseWithProcedure({
    clientId,
    employeeId,
    productId,
    quantity,
    price,
  });

  if (!purchase.ok) {
    return res.status(400).json({ message: purchase.message });
  }

  res.status(201).json({ id: purchase.id });
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
