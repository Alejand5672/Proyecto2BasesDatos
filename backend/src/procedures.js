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
