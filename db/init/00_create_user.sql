do
$$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'proy2') then
    create role proy2 login password 'secret';
  end if;
end
$$;

grant connect on database proyecto2bd to proy2;
grant usage, create on schema public to proy2;
