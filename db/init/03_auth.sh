#!/bin/sh
set -eu

PASSWORD_HASH="$(printf "%s" "$APP_LOGIN_PASSWORD" | sha256sum | awk '{print $1}')"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-SQL
create table if not exists app_usuario (
  id_usuario int primary key,
  nombre varchar(100) not null,
  usuario varchar(50) unique not null,
  rol varchar(50) not null,
  db_role varchar(80) not null,
  password_hash varchar(64) not null
);

alter table app_usuario add column if not exists rol varchar(50) not null default 'administrador';
alter table app_usuario add column if not exists db_role varchar(80) not null default 'rol_tienda_admin';

insert into app_usuario (id_usuario, nombre, usuario, rol, db_role, password_hash)
values
  (1, 'Administrador general', '${APP_LOGIN_USER}', 'administrador', 'rol_tienda_admin', '${PASSWORD_HASH}'),
  (2, 'Encargado inventario', 'inventario', 'inventario', 'rol_tienda_inventario', '${PASSWORD_HASH}'),
  (3, 'Encargado ventas', 'ventas', 'ventas', 'rol_tienda_ventas', '${PASSWORD_HASH}'),
  (4, 'Analista reportes', 'reportes', 'reportes', 'rol_tienda_reportes', '${PASSWORD_HASH}'),
  (5, 'Auditor interno', 'auditor', 'auditor', 'rol_tienda_auditoria', '${PASSWORD_HASH}')
on conflict (id_usuario) do update
set
  nombre = excluded.nombre,
  usuario = excluded.usuario,
  rol = excluded.rol,
  db_role = excluded.db_role,
  password_hash = excluded.password_hash;

delete from app_usuario where id_usuario not in (1, 2, 3, 4, 5);
grant select, insert, update, delete on app_usuario to ${DB_USER};
SQL
