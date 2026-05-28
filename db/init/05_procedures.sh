#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-SQL
create or replace procedure sp_dashboard_totales(inout result refcursor)
language plpgsql
as \$\$
begin
  open result for
    select
      (select count(*) from producto)::int as "productCount",
      (select count(*) from compra)::int as "purchaseCount",
      (select coalesce(sum(cantidad * precio_venta), 0) from detalle_compra)::float as "salesTotal",
      (select count(*) from producto where stock < 60)::int as "criticalStock";
end;
\$\$;

create or replace procedure sp_dashboard_ventas_categoria(inout result refcursor)
language plpgsql
as \$\$
begin
  open result for
    select
      c.nombre as category,
      sum(dc.cantidad * dc.precio_venta)::float as total
    from detalle_compra dc
    join producto p on p.id_producto = dc.id_producto
    join categoria c on c.id_categoria = p.id_categoria
    group by c.nombre
    having sum(dc.cantidad * dc.precio_venta) > 0
    order by total desc
    limit 5;
end;
\$\$;

create or replace procedure sp_dashboard_stock_bajo(inout result refcursor)
language plpgsql
as \$\$
begin
  open result for
    select
      p.id_producto as id,
      p.nombre as name,
      c.nombre as category,
      p.stock,
      p.precio_base::float as price
    from producto p
    join categoria c on c.id_categoria = p.id_categoria
    where p.stock < (select avg(stock) from producto)
    order by p.stock asc
    limit 6;
end;
\$\$;

create or replace procedure sp_dashboard_movimientos(inout result refcursor)
language plpgsql
as \$\$
begin
  open result for
    select
      hs.tipo_movimiento as type,
      p.nombre as product,
      concat(hs.descripcion, ' - ', hs.cantidad, ' unidades') as detail
    from historial_stock hs
    join producto p on p.id_producto = hs.id_producto
    order by hs.fecha desc, hs.id_historial desc
    limit 4;
end;
\$\$;

create or replace procedure sp_reporte_top_productos(inout result refcursor)
language plpgsql
as \$\$
begin
  open result for
    select
      v.producto,
      v.categoria,
      v.unidades::int,
      v.total_vendido::float as total,
      coalesce(pr.nombre, 'Sin proveedor') as supplier
    from vista_top_productos_vendidos v
    left join producto_proveedor pp on pp.id_producto = v.id_producto
    left join proveedor pr on pr.id_proveedor = pp.id_proveedor
    where v.unidades > 0
    order by v.total_vendido desc
    limit 8;
end;
\$\$;

create or replace procedure sp_validar_stock_compra(
  in p_id_producto int,
  in p_cantidad int,
  out p_disponible boolean,
  out p_stock_actual int,
  out p_mensaje text
)
language plpgsql
as \$\$
begin
  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'La cantidad debe ser mayor a cero.';
  end if;

  select stock
  into p_stock_actual
  from producto
  where id_producto = p_id_producto;

  if p_stock_actual is null then
    raise exception 'Producto no encontrado.';
  end if;

  p_disponible := p_stock_actual >= p_cantidad;

  if p_disponible then
    p_mensaje := 'Stock disponible para completar la compra.';
  else
    p_mensaje := format(
      'No hay stock suficiente. Disponible: %s, solicitado: %s.',
      p_stock_actual,
      p_cantidad
    );
  end if;
exception
  when others then
    p_disponible := false;
    p_stock_actual := coalesce(p_stock_actual, 0);
    p_mensaje := sqlerrm;
end;
\$\$;

create or replace procedure sp_registrar_compra(
  in p_id_cliente int,
  in p_id_empleado int,
  in p_id_producto int,
  in p_cantidad int,
  in p_precio_venta numeric,
  out p_ok boolean,
  out p_id_compra int,
  out p_mensaje text
)
language plpgsql
as \$\$
declare
  v_stock_actual int;
  v_id_detalle int;
  v_id_historial int;
begin
  p_ok := false;
  p_id_compra := null;
  p_mensaje := '';

  if p_cantidad is null or p_cantidad <= 0 then
    rollback;
    p_mensaje := 'La cantidad debe ser mayor a cero.';
    return;
  end if;

  if p_precio_venta is null or p_precio_venta <= 0 then
    rollback;
    p_mensaje := 'El precio de venta debe ser mayor a cero.';
    return;
  end if;

  if not exists (select 1 from cliente where id_cliente = p_id_cliente) then
    rollback;
    p_mensaje := 'Cliente no encontrado.';
    return;
  end if;

  if not exists (select 1 from empleado where id_empleado = p_id_empleado) then
    rollback;
    p_mensaje := 'Empleado no encontrado.';
    return;
  end if;

  select stock
  into v_stock_actual
  from producto
  where id_producto = p_id_producto
  for update;

  if v_stock_actual is null then
    rollback;
    p_mensaje := 'Producto no encontrado.';
    return;
  end if;

  if v_stock_actual < p_cantidad then
    rollback;
    p_mensaje := format(
      'No hay stock suficiente. Disponible: %s, solicitado: %s.',
      v_stock_actual,
      p_cantidad
    );
    return;
  end if;

  select coalesce(max(id_compra), 0) + 1 into p_id_compra from compra;
  select coalesce(max(id_detalle), 0) + 1 into v_id_detalle from detalle_compra;
  select coalesce(max(id_historial), 0) + 1 into v_id_historial from historial_stock;

  insert into compra (id_compra, fecha, id_cliente, id_empleado)
  values (p_id_compra, current_date, p_id_cliente, p_id_empleado);

  insert into detalle_compra (id_detalle, cantidad, precio_venta, id_compra, id_producto)
  values (v_id_detalle, p_cantidad, p_precio_venta, p_id_compra, p_id_producto);

  update producto
  set stock = stock - p_cantidad
  where id_producto = p_id_producto;

  insert into historial_stock (id_historial, tipo_movimiento, cantidad, descripcion, fecha, id_producto)
  values (v_id_historial, 'salida', p_cantidad, 'Venta registrada', current_date, p_id_producto);

  p_ok := true;
  p_mensaje := 'Compra registrada correctamente.';
  commit;
end;
\$\$;

grant execute on procedure sp_dashboard_totales(refcursor) to ${DB_USER};
grant execute on procedure sp_dashboard_ventas_categoria(refcursor) to ${DB_USER};
grant execute on procedure sp_dashboard_stock_bajo(refcursor) to ${DB_USER};
grant execute on procedure sp_dashboard_movimientos(refcursor) to ${DB_USER};
grant execute on procedure sp_reporte_top_productos(refcursor) to ${DB_USER};
grant execute on procedure sp_validar_stock_compra(int, int) to ${DB_USER};
grant execute on procedure sp_registrar_compra(int, int, int, int, numeric) to ${DB_USER};
SQL
