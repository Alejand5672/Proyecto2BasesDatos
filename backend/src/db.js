import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const requiredEnv = ["DB_NAME", "DB_USER", "DB_PASSWORD"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno ${key}`);
  }
}

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}
