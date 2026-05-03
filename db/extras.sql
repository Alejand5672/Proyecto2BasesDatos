-- Ejecutar despues de avacnesproyecto2.sql.
-- Esta vista alimenta la UI desde el backend y ayuda a cumplir la parte de VIEW de la rubrica.

create or replace view vista_top_productos_vendidos as
select
  p.id_producto,
  p.nombre as producto,
  c.nombre as categoria,
  coalesce(sum(dc.cantidad), 0) as unidades,
  coalesce(sum(dc.cantidad * dc.precio_venta), 0) as total_vendido
from producto p
join categoria c on c.id_categoria = p.id_categoria
left join detalle_compra dc on dc.id_producto = p.id_producto
group by p.id_producto, p.nombre, c.nombre;
