import { DataTypes } from "sequelize";
import { sequelize } from "./sequelize.js";

export const Category = sequelize.define(
  "Category",
  {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nombre: DataTypes.STRING(100),
  },
  {
    tableName: "categoria",
    timestamps: false,
  }
);

export const Supplier = sequelize.define(
  "Supplier",
  {
    id_proveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nombre: DataTypes.STRING(100),
  },
  {
    tableName: "proveedor",
    timestamps: false,
  }
);

export const Product = sequelize.define(
  "Product",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nombre: DataTypes.STRING(100),
    precio_base: DataTypes.DECIMAL(10, 2),
    stock: DataTypes.INTEGER,
    id_categoria: DataTypes.INTEGER,
  },
  {
    tableName: "producto",
    timestamps: false,
  }
);

export const ProductSupplier = sequelize.define(
  "ProductSupplier",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    precio_compra: DataTypes.DECIMAL(10, 2),
  },
  {
    tableName: "producto_proveedor",
    timestamps: false,
  }
);

export const PurchaseDetail = sequelize.define(
  "PurchaseDetail",
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    cantidad: DataTypes.INTEGER,
    precio_venta: DataTypes.DECIMAL(10, 2),
    id_compra: DataTypes.INTEGER,
    id_producto: DataTypes.INTEGER,
  },
  {
    tableName: "detalle_compra",
    timestamps: false,
  }
);

export const StockHistory = sequelize.define(
  "StockHistory",
  {
    id_historial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    tipo_movimiento: DataTypes.STRING(50),
    cantidad: DataTypes.INTEGER,
    descripcion: DataTypes.STRING(255),
    fecha: DataTypes.DATEONLY,
    id_producto: DataTypes.INTEGER,
  },
  {
    tableName: "historial_stock",
    timestamps: false,
  }
);

Product.belongsTo(Category, {
  as: "category",
  foreignKey: "id_categoria",
});

Product.hasMany(ProductSupplier, {
  as: "productSuppliers",
  foreignKey: "id_producto",
});

ProductSupplier.belongsTo(Supplier, {
  as: "supplier",
  foreignKey: "id_proveedor",
});
