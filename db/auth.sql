create table if not exists app_usuario (
  id_usuario int primary key,
  nombre varchar(100) not null,
  usuario varchar(50) unique not null,
  password_hash varchar(64) not null
);

insert into app_usuario (id_usuario, nombre, usuario, password_hash)
values
  (1, 'Administrador', 'admin', '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b')
on conflict (id_usuario) do update
set
  nombre = excluded.nombre,
  usuario = excluded.usuario,
  password_hash = excluded.password_hash;

grant select, insert, update, delete on app_usuario to proy2;
