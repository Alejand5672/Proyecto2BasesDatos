#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-SQL
grant select, insert, update, delete on all tables in schema public to ${DB_USER};
grant usage, select, update on all sequences in schema public to ${DB_USER};

alter default privileges in schema public
grant select, insert, update, delete on tables to ${DB_USER};

alter default privileges in schema public
grant usage, select, update on sequences to ${DB_USER};
SQL
