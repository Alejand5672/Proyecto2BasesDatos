import { Router } from "express";
import { query } from "../db.js";
import { asyncRoute } from "../middleware.js";
import { sql } from "../queries.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", asyncRoute(async (_req, res) => {
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
