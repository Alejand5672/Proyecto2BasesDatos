import { Router } from "express";
import { asyncRoute, requireRole } from "../middleware.js";
import { Category, Product, ProductSupplier, PurchaseDetail, StockHistory, Supplier } from "../orm/models.js";
import { sequelize } from "../orm/sequelize.js";

export const productRoutes = Router();

function mapProduct(product) {
  const supplierLink = product.productSuppliers?.[0];

  return {
    id: product.id_producto,
    name: product.nombre,
    price: Number(product.precio_base),
    stock: product.stock,
    categoryId: product.id_categoria,
    category: product.category?.nombre || "",
    supplierId: supplierLink?.id_proveedor || null,
    supplier: supplierLink?.supplier?.nombre || "",
    buyPrice: supplierLink ? Number(supplierLink.precio_compra) : 0,
  };
}

function validateProductPayload({ name, price, stock, categoryId, supplierId, buyPrice }) {
  return (
    name &&
    Number(price) > 0 &&
    Number(stock) >= 0 &&
    categoryId &&
    supplierId &&
    Number(buyPrice) > 0
  );
}

productRoutes.get("/", asyncRoute(async (_req, res) => {
  const products = await Product.findAll({
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id_categoria", "nombre"],
      },
      {
        model: ProductSupplier,
        as: "productSuppliers",
        attributes: ["id_producto", "id_proveedor", "precio_compra"],
        include: [
          {
            model: Supplier,
            as: "supplier",
            attributes: ["id_proveedor", "nombre"],
          },
        ],
      },
    ],
    order: [["id_producto", "ASC"]],
  });

  res.json(products.map(mapProduct));
}));

productRoutes.post("/", requireRole("administrador", "inventario"), asyncRoute(async (req, res) => {
  const { name, price, stock, categoryId, supplierId, buyPrice } = req.body;
  if (!validateProductPayload(req.body)) {
    return res.status(400).json({ message: "Datos invalidos para crear producto." });
  }

  const result = await sequelize.transaction(async (transaction) => {
    const nextId = Number(await Product.max("id_producto", { transaction })) + 1 || 1;

    const product = await Product.create(
      {
        id_producto: nextId,
        nombre: name.trim(),
        precio_base: price,
        stock,
        id_categoria: categoryId,
      },
      { transaction }
    );

    await ProductSupplier.create(
      {
        id_producto: nextId,
        id_proveedor: supplierId,
        precio_compra: buyPrice,
      },
      { transaction }
    );

    return { id: product.id_producto };
  });

  res.status(201).json(result);
}));

productRoutes.put("/:id", requireRole("administrador", "inventario"), asyncRoute(async (req, res) => {
  const { name, price, stock, categoryId, supplierId, buyPrice } = req.body;
  if (!validateProductPayload(req.body)) {
    return res.status(400).json({ message: "Datos invalidos para actualizar producto." });
  }

  await sequelize.transaction(async (transaction) => {
    const [updated] = await Product.update(
      {
        nombre: name.trim(),
        precio_base: price,
        stock,
        id_categoria: categoryId,
      },
      {
        where: { id_producto: req.params.id },
        transaction,
      }
    );

    if (!updated) {
      throw new Error("Producto no encontrado.");
    }

    await PurchaseDetail.update(
      { precio_venta: price },
      {
        where: { id_producto: req.params.id },
        transaction,
      }
    );

    await ProductSupplier.destroy({
      where: { id_producto: req.params.id },
      transaction,
    });

    await ProductSupplier.create(
      {
        id_producto: Number(req.params.id),
        id_proveedor: supplierId,
        precio_compra: buyPrice,
      },
      { transaction }
    );
  });

  res.json({ ok: true });
}));

productRoutes.delete("/:id", requireRole("administrador", "inventario"), asyncRoute(async (req, res) => {
  await sequelize.transaction(async (transaction) => {
    await ProductSupplier.destroy({
      where: { id_producto: req.params.id },
      transaction,
    });

    await StockHistory.destroy({
      where: { id_producto: req.params.id },
      transaction,
    });

    await PurchaseDetail.destroy({
      where: { id_producto: req.params.id },
      transaction,
    });

    const deleted = await Product.destroy({
      where: { id_producto: req.params.id },
      transaction,
    });

    if (!deleted) {
      throw new Error("Producto no encontrado.");
    }
  });

  res.json({ ok: true });
}));
