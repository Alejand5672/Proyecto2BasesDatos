import { Router } from "express";
import { query } from "../db.js";
import { asyncRoute, requireRole } from "../middleware.js";
import { sql } from "../queries.js";

export const reportRoutes = Router();

reportRoutes.get("/", requireRole("administrador", "reportes", "auditor"), asyncRoute(async (_req, res) => {
  const [
    topProducts,
    topClients,
    supplierCount,
    joinProductSales,
    joinPurchaseDetails,
    joinSupplierInventory,
    productsBelowAverageStock,
    productsWithSalesExists,
    salesByCategoryHaving,
  ] = await Promise.all([
    query(sql.topProductsFromView),
    query(sql.topClientsCte),
    query("select count(*)::int as total from proveedor"),
    query(sql.joinProductSales),
    query(sql.joinPurchaseDetails),
    query(sql.joinSupplierInventory),
    query(sql.productsBelowAverageStock),
    query(sql.productsWithSalesExists),
    query(sql.salesByCategoryHavingReport),
  ]);

  res.json({
    cards: [
      {
        title: "Productos mas vendidos",
        value: topProducts[0]?.producto || "Sin ventas",
        detail: "Producto lider por total vendido",
      },
      {
        title: "Mejores clientes",
        value: topClients[0]?.client || "Sin compras",
        detail: "Cliente con mayor consumo registrado",
      },
      {
        title: "Proveedores vinculados",
        value: supplierCount[0]?.total || 0,
        detail: "Relaciones activas con productos actuales",
      },
      {
        title: "Inventario observado",
        value: "En tiempo real",
        detail: "Compras y ediciones actualizan la informacion mostrada",
      },
    ],
    topProducts,
    topClients,
    sections: [
      {
        title: "Ventas por producto",
        detail: "Cruza productos, categorias, proveedores y detalle de compras.",
        columns: ["Producto", "Categoria", "Proveedor", "Unidades", "Total"],
        rows: joinProductSales.map((row) => [
          row.producto,
          row.categoria,
          row.proveedor,
          row.unidades,
          row.total,
        ]),
      },
      {
        title: "Compras recientes",
        detail: "Relaciona compra, cliente, empleado, producto y monto vendido.",
        columns: ["Compra", "Fecha", "Cliente", "Empleado", "Producto", "Total"],
        rows: joinPurchaseDetails.map((row) => [
          row.compra,
          String(row.fecha).slice(0, 10),
          row.cliente,
          row.empleado,
          row.producto,
          row.total,
        ]),
      },
      {
        title: "Abastecimiento por proveedor",
        detail: "Muestra proveedores, productos, categorias, stock y costo de compra.",
        columns: ["Proveedor", "Producto", "Categoria", "Stock", "Costo"],
        rows: joinSupplierInventory.map((row) => [
          row.proveedor,
          row.producto,
          row.categoria,
          row.stock,
          row.costo,
        ]),
      },
      {
        title: "Inventario bajo promedio",
        detail: "Productos cuyo stock esta por debajo del promedio general.",
        columns: ["Producto", "Categoria", "Stock", "Promedio"],
        rows: productsBelowAverageStock.map((row) => [
          row.producto,
          row.categoria,
          row.stock,
          row.promedio,
        ]),
      },
      {
        title: "Productos con ventas registradas",
        detail: "Lista productos que aparecen al menos una vez en el detalle de compras.",
        columns: ["Producto", "Categoria", "Precio", "Stock"],
        rows: productsWithSalesExists.map((row) => [
          row.producto,
          row.categoria,
          row.precio,
          row.stock,
        ]),
      },
      {
        title: "Ventas por categoria",
        detail: "Agrupa ventas por categoria y muestra solo categorias con ventas relevantes.",
        columns: ["Categoria", "Unidades", "Total"],
        rows: salesByCategoryHaving.map((row) => [row.categoria, row.unidades, row.total]),
      },
      {
        title: "Clientes destacados",
        detail: "Calcula el consumo total por cliente antes de ordenar el ranking.",
        columns: ["Cliente", "Total"],
        rows: topClients.map((row) => [row.client, row.total]),
      },
      {
        title: "Resumen de productos vendidos",
        detail: "Datos alimentados por una vista reutilizable del backend.",
        columns: ["Producto", "Categoria", "Unidades", "Total", "Proveedor"],
        rows: topProducts.map((row) => [
          row.producto,
          row.categoria,
          row.unidades,
          row.total,
          row.supplier,
        ]),
      },
    ],
  });
}));
