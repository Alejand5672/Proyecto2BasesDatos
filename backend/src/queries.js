export const sql = {
  categories: `
    select id_categoria as id, nombre
    from categoria
    order by nombre
  `,

  clients: `
    select id_cliente as id, nombre
    from cliente
    order by nombre
  `,

  employees: `
    select id_empleado as id, nombre
    from empleado
    order by nombre
  `,

  products: `
    select
      p.id_producto as id,
      p.nombre as name,
      p.precio_base::float as price,
      p.stock,
      c.id_categoria as "categoryId",
      c.nombre as category
    from producto p
    join categoria c on c.id_categoria = p.id_categoria
    order by p.id_producto
  `,

  purchases: `
    select
      co.id_compra as id,
      co.fecha,
      cl.id_cliente as "clientId",
      cl.nombre as client,
      e.id_empleado as "employeeId",
      e.nombre as employee,
      dc.id_detalle as "detailId",
      p.id_producto as "productId",
      p.nombre as product,
      dc.cantidad::int as quantity,
      dc.precio_venta::float as price,
      (dc.cantidad * dc.precio_venta)::float as total
    from compra co
    join cliente cl on cl.id_cliente = co.id_cliente
    join empleado e on e.id_empleado = co.id_empleado
    join detalle_compra dc on dc.id_compra = co.id_compra
    join producto p on p.id_producto = dc.id_producto
    order by co.id_compra desc
  `,

  salesByCategory: `
    select
      c.nombre as category,
      sum(dc.cantidad * dc.precio_venta)::float as total
    from detalle_compra dc
    join producto p on p.id_producto = dc.id_producto
    join categoria c on c.id_categoria = p.id_categoria
    group by c.nombre
    having sum(dc.cantidad * dc.precio_venta) > 0
    order by total desc
    limit 5
  `,

  lowStock: `
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
    limit 6
  `,

  movements: `
    select
      hs.tipo_movimiento as type,
      p.nombre as product,
      concat(hs.descripcion, ' - ', hs.cantidad, ' unidades') as detail
    from historial_stock hs
    join producto p on p.id_producto = hs.id_producto
    order by hs.fecha desc, hs.id_historial desc
    limit 4
  `,

  topProductsFromView: `
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
    limit 8
  `,

  joinProductSales: `
    select
      p.nombre as producto,
      c.nombre as categoria,
      pr.nombre as proveedor,
      coalesce(sum(dc.cantidad), 0)::int as unidades,
      coalesce(sum(dc.cantidad * dc.precio_venta), 0)::float as total
    from producto p
    join categoria c on c.id_categoria = p.id_categoria
    join producto_proveedor pp on pp.id_producto = p.id_producto
    join proveedor pr on pr.id_proveedor = pp.id_proveedor
    left join detalle_compra dc on dc.id_producto = p.id_producto
    group by p.id_producto, p.nombre, c.nombre, pr.nombre
    order by total desc
    limit 8
  `,

  joinPurchaseDetails: `
    select
      co.id_compra as compra,
      co.fecha,
      cl.nombre as cliente,
      e.nombre as empleado,
      p.nombre as producto,
      (dc.cantidad * dc.precio_venta)::float as total
    from compra co
    join cliente cl on cl.id_cliente = co.id_cliente
    join empleado e on e.id_empleado = co.id_empleado
    join detalle_compra dc on dc.id_compra = co.id_compra
    join producto p on p.id_producto = dc.id_producto
    order by co.fecha desc, co.id_compra desc
    limit 8
  `,

  joinSupplierInventory: `
    select
      pr.nombre as proveedor,
      p.nombre as producto,
      c.nombre as categoria,
      p.stock::int,
      pp.precio_compra::float as costo
    from producto_proveedor pp
    join proveedor pr on pr.id_proveedor = pp.id_proveedor
    join producto p on p.id_producto = pp.id_producto
    join categoria c on c.id_categoria = p.id_categoria
    order by p.stock asc
    limit 8
  `,

  productsBelowAverageStock: `
    select
      p.nombre as producto,
      c.nombre as categoria,
      p.stock::int,
      round((select avg(stock) from producto), 2)::float as promedio
    from producto p
    join categoria c on c.id_categoria = p.id_categoria
    where p.stock < (select avg(stock) from producto)
    order by p.stock asc
    limit 8
  `,

  productsWithSalesExists: `
    select
      p.nombre as producto,
      c.nombre as categoria,
      p.precio_base::float as precio,
      p.stock::int
    from producto p
    join categoria c on c.id_categoria = p.id_categoria
    where exists (
      select 1
      from detalle_compra dc
      where dc.id_producto = p.id_producto
    )
    order by p.precio_base desc
    limit 8
  `,

  salesByCategoryHavingReport: `
    select
      c.nombre as categoria,
      sum(dc.cantidad)::int as unidades,
      sum(dc.cantidad * dc.precio_venta)::float as total
    from detalle_compra dc
    join producto p on p.id_producto = dc.id_producto
    join categoria c on c.id_categoria = p.id_categoria
    group by c.nombre
    having sum(dc.cantidad * dc.precio_venta) > 100
    order by total desc
    limit 8
  `,

  topClientsCte: `
    with ventas_cliente as (
      select
        cl.id_cliente,
        cl.nombre,
        sum(dc.cantidad * dc.precio_venta) as total
      from cliente cl
      join compra co on co.id_cliente = cl.id_cliente
      join detalle_compra dc on dc.id_compra = co.id_compra
      group by cl.id_cliente, cl.nombre
    )
    select nombre as client, total::float
    from ventas_cliente
    order by total desc
    limit 5
  `,

  productSuppliers: `
    select
      pr.nombre as supplier,
      p.nombre as product,
      c.nombre as category,
      p.stock::int,
      pp.precio_compra::float as "buyPrice"
    from producto_proveedor pp
    join proveedor pr on pr.id_proveedor = pp.id_proveedor
    join producto p on p.id_producto = pp.id_producto
    join categoria c on c.id_categoria = p.id_categoria
    order by p.nombre
  `,
};
