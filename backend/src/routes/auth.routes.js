import { Router } from "express";
import { query } from "../db.js";
import { asyncRoute } from "../middleware.js";
import { hashPassword } from "../password.js";

export const authRoutes = Router();

authRoutes.get("/health", asyncRoute(async (_req, res) => {
  await query("select 1");
  res.json({ ok: true });
}));

authRoutes.get("/auth/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

authRoutes.post("/auth/login", asyncRoute(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Ingresa usuario y contrasena." });
  }

  const rows = await query(
    `
      select id_usuario as id, nombre, usuario
      from app_usuario
      where usuario = $1 and password_hash = $2
    `,
    [username.trim(), hashPassword(password)]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Credenciales incorrectas." });
  }

  req.session.user = rows[0];
  res.json({ user: rows[0] });
}));

authRoutes.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("proyecto2.sid");
    res.json({ ok: true });
  });
});
