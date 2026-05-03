-- Sincroniza datos derivados cuando se actualizan productos desde la UI.
-- Ejecutar una vez si ya editaste productos antes de esta correccion.

update detalle_compra dc
set precio_venta = p.precio_base
from producto p
where dc.id_producto = p.id_producto;

update producto_proveedor pp
set precio_compra = round((p.precio_base * 0.78)::numeric, 2)
from producto p
where pp.id_producto = p.id_producto;
