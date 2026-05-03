# Frontend - Proyecto 2 BD

Interfaz inicial para el sistema de inventario y ventas solicitado en el enunciado.

Por ahora es una maqueta funcional con datos en memoria basados en `avacnesproyecto2.sql`.
La siguiente fase es conectar estas vistas al backend con SQL explicito.

## Estructura

- `index.html`: estructura de pantallas.
- `styles.css`: sistema visual y responsive.
- `app.js`: datos, estado, eventos, validaciones y logica principal.
- `screens/`: renderizado separado por pantalla.

## Abrir en desarrollo

Desde `frontend/`:

```bash
python -m http.server 8080
```

Despues abre `http://localhost:8080`.

Pantallas incluidas:

- Dashboard con metricas, movimientos y reporte visible.
- CRUD visual de productos.
- CRUD visual de compras con validacion de stock.
- Reportes SQL requeridos por la rubrica.
- Proveedores por producto.
