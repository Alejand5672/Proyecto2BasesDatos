#!/bin/sh
set -eu

PASSWORD_HASH="$(printf "%s" "$APP_LOGIN_PASSWORD" | sha256sum | awk '{print $1}')"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-SQL
create table if not exists app_usuario (
  id_usuario int primary key,
  nombre varchar(100) not null,
  usuario varchar(50) unique not null,
  password_hash varchar(64) not null
);

insert into app_usuario (id_usuario, nombre, usuario, password_hash)
values (1, 'Usuario Proyecto', '${APP_LOGIN_USER}', '${PASSWORD_HASH}')
on conflict (id_usuario) do update
set
  nombre = excluded.nombre,
  usuario = excluded.usuario,
  password_hash = excluded.password_hash;

delete from app_usuario where usuario <> '${APP_LOGIN_USER}';
grant select, insert, update, delete on app_usuario to ${DB_USER};
SQL
