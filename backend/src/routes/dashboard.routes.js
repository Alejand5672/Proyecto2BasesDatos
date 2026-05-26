import { Router } from "express";
import { asyncRoute } from "../middleware.js";
import { callCursorProcedure } from "../procedures.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", asyncRoute(async (_req, res) => {
  const [totals, salesByCategory, lowStock, movements] = await Promise.all([
    callCursorProcedure("sp_dashboard_totales"),
    callCursorProcedure("sp_dashboard_ventas_categoria"),
    callCursorProcedure("sp_dashboard_stock_bajo"),
    callCursorProcedure("sp_dashboard_movimientos"),
  ]);

  res.json({ ...totals[0], salesByCategory, lowStock, movements });
}));
