import { Router } from "express";
import { query } from "../db.js";
import { asyncRoute, requireRole } from "../middleware.js";
import { sql } from "../queries.js";

export const supplierRoutes = Router();

supplierRoutes.get("/", requireRole("administrador", "inventario", "reportes", "auditor"), asyncRoute(async (_req, res) => {
  res.json(await query(sql.productSuppliers));
}));
