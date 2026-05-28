import { pool } from "./db.js";

function assertProcedureName(name) {
  if (!/^sp_[a-z0-9_]+$/.test(name)) {
    throw new Error("Nombre de stored procedure invalido.");
  }
}

export async function callCursorProcedure(name) {
  assertProcedureName(name);

  const client = await pool.connect();
  const cursorName = `${name}_cursor_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  try {
    await client.query("BEGIN");
    await client.query(`CALL ${name}($1)`, [cursorName]);
    const result = await client.query(`FETCH ALL FROM "${cursorName}"`);
    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function validatePurchaseStock(productId, quantity) {
  const result = await pool.query("CALL sp_validar_stock_compra($1, $2, null, null, null)", [
    productId,
    quantity,
  ]);

  return {
    available: result.rows[0].p_disponible,
    currentStock: Number(result.rows[0].p_stock_actual || 0),
    message: result.rows[0].p_mensaje,
  };
}

export async function registerPurchaseWithProcedure({ clientId, employeeId, productId, quantity, price }) {
  const result = await pool.query(
    "CALL sp_registrar_compra($1, $2, $3, $4, $5, null, null, null)",
    [clientId, employeeId, productId, quantity, price]
  );

  return {
    ok: result.rows[0].p_ok,
    id: result.rows[0].p_id_compra,
    message: result.rows[0].p_mensaje,
  };
}
