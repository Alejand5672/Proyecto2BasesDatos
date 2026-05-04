import cors from "cors";
import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth } from "./middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { catalogRoutes } from "./routes/catalog.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { productRoutes } from "./routes/products.routes.js";
import { purchaseRoutes } from "./routes/purchases.routes.js";
import { reportRoutes } from "./routes/reports.routes.js";
import { supplierRoutes } from "./routes/suppliers.routes.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPath = path.join(__dirname, "..", "..", "frontend");

if (!process.env.SESSION_SECRET) {
  throw new Error("Falta la variable de entorno SESSION_SECRET");
}

app.use(cors());
app.use(express.json());
app.use(
  session({
    name: "proyecto2.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);
app.use(express.static(frontendPath));

app.use("/api", authRoutes);
app.use("/api", requireAuth);
app.use("/api/catalogs", catalogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/suppliers", supplierRoutes);

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Error interno del servidor." });
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
