import { Router } from "express";
import { query } from "../db.js";
import { asyncRoute } from "../middleware.js";
import { sql } from "../queries.js";

export const supplierRoutes = Router();

supplierRoutes.get("/", asyncRoute(async (_req, res) => {
  res.json(await query(sql.productSuppliers));
}));
