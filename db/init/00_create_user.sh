#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-SQL
do
\$\$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = '${DB_USER}') then
    execute format('create role %I login password %L', '${DB_USER}', '${DB_PASSWORD}');
  else
    execute format('alter role %I with login password %L', '${DB_USER}', '${DB_PASSWORD}');
  end if;
end
\$\$;

grant connect on database ${DB_NAME} to ${DB_USER};
grant usage, create on schema public to ${DB_USER};
SQL
