# Esquema de roles - Proyecto 3

Los roles existen en PostgreSQL y se crean durante la inicializacion del contenedor de base de datos en `db/init/04_roles.sh`. Cada usuario de prueba esta registrado en la tabla `app_usuario` con un rol de aplicacion y un rol equivalente del DBMS.

## Usuarios de prueba

| Usuario | Contrasena | Rol de aplicacion | Rol en PostgreSQL |
| --- | --- | --- | --- |
| `proy3` | `secret` | `administrador` | `rol_tienda_admin` |
| `inventario` | `secret` | `inventario` | `rol_tienda_inventario` |
| `ventas` | `secret` | `ventas` | `rol_tienda_ventas` |
| `reportes` | `secret` | `reportes` | `rol_tienda_reportes` |
| `auditor` | `secret` | `auditor` | `rol_tienda_auditoria` |

## Permisos por rol

| Rol PostgreSQL | Responsabilidad | Tablas accesibles | Operaciones permitidas |
| --- | --- | --- | --- |
| `rol_tienda_admin` | Administracion general | Todas las tablas del esquema public | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `rol_tienda_inventario` | Gestion de catalogo e inventario | `categoria`, `proveedor`, `producto`, `producto_proveedor`, `historial_stock` | `SELECT` en tablas de catalogo; `INSERT`, `UPDATE`, `DELETE` en producto, relacion producto-proveedor e historial |
| `rol_tienda_ventas` | Registro y mantenimiento de compras/ventas | `cliente`, `empleado`, `producto`, `categoria`, `compra`, `detalle_compra`, `historial_stock` | `SELECT` en catalogos y compras; `INSERT`, `UPDATE`, `DELETE` en compra y detalle; `UPDATE(stock)` en producto; `INSERT` en historial |
| `rol_tienda_reportes` | Consulta de reportes | `categoria`, `proveedor`, `producto`, `producto_proveedor`, `cliente`, `empleado`, `compra`, `detalle_compra`, `historial_stock`, `vista_top_productos_vendidos` | `SELECT` |
| `rol_tienda_auditoria` | Revision y auditoria de informacion | Todas las tablas y la vista de reportes | `SELECT` |

## Proteccion de vistas

| Rol de aplicacion | Vistas permitidas |
| --- | --- |
| `administrador` | Dashboard, productos, compras, reportes, proveedores |
| `inventario` | Dashboard, productos, proveedores |
| `ventas` | Dashboard, compras |
| `reportes` | Dashboard, reportes |
| `auditor` | Dashboard, reportes, proveedores |

Las rutas del backend tambien validan el rol antes de permitir operaciones de escritura:

- Productos: solo `administrador` e `inventario`.
- Compras: solo `administrador` y `ventas`.
- Reportes: `administrador`, `reportes` y `auditor`.
- Proveedores: `administrador`, `inventario`, `reportes` y `auditor`.
