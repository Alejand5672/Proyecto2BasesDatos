import { Router } from "express";
import { query } from "../db.js";
import { asyncRoute } from "../middleware.js";
import { sql } from "../queries.js";

export const catalogRoutes = Router();

catalogRoutes.get("/", asyncRoute(async (_req, res) => {
  const [categories, clients, employees, suppliers] = await Promise.all([
    query(sql.categories),
    query(sql.clients),
    query(sql.employees),
    query(sql.suppliers),
  ]);

  res.json({ categories, clients, employees, suppliers });
}));
