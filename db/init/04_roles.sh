#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-SQL
do
\$\$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'rol_tienda_admin') then
    create role rol_tienda_admin;
  end if;

  if not exists (select from pg_catalog.pg_roles where rolname = 'rol_tienda_inventario') then
    create role rol_tienda_inventario;
  end if;

  if not exists (select from pg_catalog.pg_roles where rolname = 'rol_tienda_ventas') then
    create role rol_tienda_ventas;
  end if;

  if not exists (select from pg_catalog.pg_roles where rolname = 'rol_tienda_reportes') then
    create role rol_tienda_reportes;
  end if;

  if not exists (select from pg_catalog.pg_roles where rolname = 'rol_tienda_auditoria') then
    create role rol_tienda_auditoria;
  end if;
end
\$\$;

revoke all on all tables in schema public from rol_tienda_admin;
revoke all on all tables in schema public from rol_tienda_inventario;
revoke all on all tables in schema public from rol_tienda_ventas;
revoke all on all tables in schema public from rol_tienda_reportes;
revoke all on all tables in schema public from rol_tienda_auditoria;

grant usage on schema public to rol_tienda_admin;
grant usage on schema public to rol_tienda_inventario;
grant usage on schema public to rol_tienda_ventas;
grant usage on schema public to rol_tienda_reportes;
grant usage on schema public to rol_tienda_auditoria;

grant select, insert, update, delete on all tables in schema public to rol_tienda_admin;

grant select on categoria, proveedor, producto, producto_proveedor, historial_stock to rol_tienda_inventario;
grant insert, update, delete on producto, producto_proveedor, historial_stock to rol_tienda_inventario;

grant select on cliente, empleado, producto, categoria, compra, detalle_compra to rol_tienda_ventas;
grant insert, update, delete on compra, detalle_compra to rol_tienda_ventas;
grant update (stock) on producto to rol_tienda_ventas;
grant insert on historial_stock to rol_tienda_ventas;

grant select on categoria, proveedor, producto, producto_proveedor, cliente, empleado, compra, detalle_compra, historial_stock, app_usuario to rol_tienda_reportes;
grant select on vista_top_productos_vendidos to rol_tienda_reportes;

grant select on all tables in schema public to rol_tienda_auditoria;
grant select on vista_top_productos_vendidos to rol_tienda_auditoria;

grant rol_tienda_admin to ${DB_USER};
grant rol_tienda_inventario to ${DB_USER};
grant rol_tienda_ventas to ${DB_USER};
grant rol_tienda_reportes to ${DB_USER};
grant rol_tienda_auditoria to ${DB_USER};
SQL
