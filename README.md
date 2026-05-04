# Luis Alejandro Hernández Márquez (241424)
# Bases de datos 1
# Prof. Mario Barrientos
# Proyecto 2 - Base de Datos 1

Aplicacion web para gestionar inventario, compras/ventas, proveedores y reportes de una tienda. El proyecto usa frontend con HTML, CSS y JavaScript, backend con Node.js/Express y base de datos PostgreSQL. Toda la infraestructura se levanta con Docker Compose.

## Tecnologias utilizadas

- HTML, CSS y JavaScript
- Node.js
- Express
- PostgreSQL
- pgAdmin
- Docker
- Docker Compose

## Funcionalidades principales

- Login y logout con sesion.
- Autenticacion validando usuario registrado en PostgreSQL.
- CRUD completo de productos.
- CRUD completo de compras.
- Actualizacion de stock al registrar, editar o eliminar compras.
- Registro de proveedor y precio de compra por producto.
- Dashboard con datos reales de la base de datos.
- Pantalla de reportes con consultas SQL ejecutadas desde el backend.
- Reportes visibles con JOIN, subqueries, GROUP BY, HAVING, CTE y VIEW.
- Transacciones explicitas con `BEGIN`, `COMMIT` y `ROLLBACK`.
- Manejo visible de errores y validaciones para el usuario.

## Requisitos previos

Antes de ejecutar el proyecto se necesita tener instalado:

- Docker
- Docker Compose

## Configuracion

El proyecto usa variables de entorno. Antes de levantarlo, crea el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

En PowerShell de Windows tambien puedes usar:

```powershell
Copy-Item .env.example .env
```

Las credenciales requeridas para la calificacion ya estan definidas en `.env.example`:

```env
DB_USER=proy2
DB_PASSWORD=secret
APP_LOGIN_USER=proy2
APP_LOGIN_PASSWORD=secret
```

## Levantar el proyecto

Desde la raiz del proyecto ejecuta:

```bash
docker compose up --build
```

Esto levanta los servicios definidos en `docker-compose.yml`:

- Base de datos PostgreSQL
- Backend Express
- Frontend servido por Express
- pgAdmin


Para detener los contenedores sin borrar datos:

```bash
docker compose down
```

Para reiniciar todo desde cero, incluyendo los volumenes de PostgreSQL y pgAdmin:

```bash
docker compose down -v
docker compose up --build
```

## URLs del proyecto

- Aplicacion web: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Productos: http://localhost:3000/productos
- Compras: http://localhost:3000/compras
- Reportes: http://localhost:3000/reportes
- Proveedores: http://localhost:3000/proveedores
- pgAdmin: http://localhost:5050

## Usuario de la aplicacion

La base de datos se inicializa con un usuario para entrar a la aplicacion web:

```text
Usuario: proy2
Contrasena: secret
```

En la pantalla de login tambien aparece el boton `Crear cuenta`, que muestra esas credenciales para facilitar la prueba del proyecto.

## Acceso a pgAdmin

pgAdmin se levanta en:

```text
http://localhost:5050
```

Credenciales de pgAdmin:

```text
Correo: proy2@proyecto.com
Contrasena: secret
```

Si el servidor no aparece registrado en pgAdmin, se puede crear manualmente con:

```text
Name: proyecto2bd
Host: db
Port: 5432
Maintenance database: proyecto2bd
Username: proy2
Password: secret
```

Nota: al ejecutar doccker compose down -v se borra el volumen de pgAdmin y pierde el servidor registrado manualmente. ente.

## Base de datos

PostgreSQL carga automaticamente los scripts montados en `docker-compose.yml`:

- `db/init/00_create_user.sh`: crea el usuario de base de datos `proy2`.
- `avacnesproyecto2.sql`: crea tablas, relaciones, indices y datos iniciales.
- `db/extras.sql`: crea la vista `vista_top_productos_vendidos`.
- `db/init/03_auth.sh`: crea la tabla de autenticacion `app_usuario`.
- `db/init/99_permissions.sh`: asigna permisos al usuario `proy2`.

El script principal contiene las entidades:

- `categoria`
- `proveedor`
- `producto`
- `cliente`
- `empleado`
- `compra`
- `detalle_compra`
- `historial_stock`
- `producto_proveedor`

Cada tabla principal incluye 25 registros de prueba.


## Estructura del proyecto

```text
.
├── backend/
│   └── src/
│       ├── db.js
│       ├── middleware.js
│       ├── password.js
│       ├── queries.js
│       ├── server.js
│       └── routes/
├── db/
│   ├── extras.sql
│   ├── sync_product_prices.sql
│   └── init/
├── frontend/
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── screens/
├── avacnesproyecto2.sql
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## Comandos utiles

Instalar dependencias localmente:

```bash
npm install
```

Ejecutar backend localmente, usando PostgreSQL ya levantado:

```bash
npm start
```

Modo desarrollo con recarga de Node:

```bash
npm run dev
```
