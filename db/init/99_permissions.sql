grant select, insert, update, delete on all tables in schema public to proy2;
grant usage, select, update on all sequences in schema public to proy2;

alter default privileges in schema public
grant select, insert, update, delete on tables to proy2;

alter default privileges in schema public
grant usage, select, update on sequences to proy2;
