--Luis Alejandro Hernández Márquez (241424)
--Bases de datos 1
--prof: Mario Barrientos

-- creacion de tablas
create table categoria (
id_categoria int primary key,
nombre varchar(100) not null
);

create table proveedor (
id_proveedor int primary key,
nombre varchar(100) not null
);

create table producto (
id_producto int primary key,
nombre varchar(100) not null,
precio_base decimal(10,2) not null,
stock int not null,
id_categoria int not null,
foreign key (id_categoria) references categoria(id_categoria)
);

create table cliente (
id_cliente int primary key,
nombre varchar(100) not null
);

create table empleado (
id_empleado int primary key,
nombre varchar(100) not null
);

create table compra (
id_compra int primary key,
fecha date not null,
id_cliente int not null,
id_empleado int not null,
foreign key (id_cliente) references cliente(id_cliente),
foreign key (id_empleado) references empleado(id_empleado)
);

create table detalle_compra (
id_detalle int primary key,
cantidad int not null,
precio_venta decimal(10,2) not null,
id_compra int not null,
id_producto int not null,
foreign key (id_compra) references compra(id_compra),
foreign key (id_producto) references producto(id_producto)
);

create table historial_stock (
id_historial int primary key,
tipo_movimiento varchar(50) not null,
cantidad int not null,
descripcion varchar(255),
fecha date not null,
id_producto int not null,
foreign key (id_producto) references producto(id_producto)
);

create table producto_proveedor (
id_producto int,
id_proveedor int,
precio_compra decimal(10,2) not null,
primary key (id_producto, id_proveedor),
foreign key (id_producto) references producto(id_producto),
foreign key (id_proveedor) references proveedor(id_proveedor)
);

--creacion de indices
create index idx_producto_categoria on producto(id_categoria);
create index idx_detalle_compra_compra on detalle_compra(id_compra);
create index idx_historial_producto on historial_stock(id_producto);

--insertar en tablas
insert into categoria values
(1,'Electrónica'),(2,'Ropa'),(3,'Alimentos'),(4,'Hogar'),(5,'Deportes'),
(6,'Juguetes'),(7,'Libros'),(8,'Belleza'),(9,'Automotriz'),(10,'Mascotas'),
(11,'Tecnología'),(12,'Oficina'),(13,'Salud'),(14,'Accesorios'),(15,'Calzado'),
(16,'Herramientas'),(17,'Jardín'),(18,'Música'),(19,'Videojuegos'),(20,'Bebidas'),
(21,'Panadería'),(22,'Lácteos'),(23,'Carnes'),(24,'Frutas'),(25,'Verduras');

insert into proveedor values
(1,'Proveedor A'),(2,'Proveedor B'),(3,'Proveedor C'),(4,'Proveedor D'),(5,'Proveedor E'),
(6,'Proveedor F'),(7,'Proveedor G'),(8,'Proveedor H'),(9,'Proveedor I'),(10,'Proveedor J'),
(11,'Proveedor K'),(12,'Proveedor L'),(13,'Proveedor M'),(14,'Proveedor N'),(15,'Proveedor O'),
(16,'Proveedor P'),(17,'Proveedor Q'),(18,'Proveedor R'),(19,'Proveedor S'),(20,'Proveedor T'),
(21,'Proveedor U'),(22,'Proveedor V'),(23,'Proveedor W'),(24,'Proveedor X'),(25,'Proveedor Y');

insert into producto values
(1,'Producto 1',10.50,100,1),(2,'Producto 2',20.00,80,2),(3,'Producto 3',5.75,200,3),
(4,'Producto 4',15.30,60,4),(5,'Producto 5',50.00,40,5),(6,'Producto 6',8.90,150,6),
(7,'Producto 7',12.40,90,7),(8,'Producto 8',22.10,70,8),(9,'Producto 9',18.60,55,9),
(10,'Producto 10',30.00,45,10),(11,'Producto 11',9.99,110,11),(12,'Producto 12',14.25,95,12),
(13,'Producto 13',7.80,120,13),(14,'Producto 14',11.00,130,14),(15,'Producto 15',60.00,20,15),
(16,'Producto 16',16.40,75,16),(17,'Producto 17',13.50,85,17),(18,'Producto 18',19.99,65,18),
(19,'Producto 19',25.00,50,19),(20,'Producto 20',6.75,140,20),(21,'Producto 21',4.50,160,21),
(22,'Producto 22',3.80,170,22),(23,'Producto 23',12.60,95,23),(24,'Producto 24',2.90,180,24),
(25,'Producto 25',1.50,200,25);

insert into cliente values
(1,'Juan Perez'),(2,'Maria Lopez'),(3,'Carlos Ruiz'),(4,'Ana Gomez'),(5,'Luis Torres'),
(6,'Pedro Ramirez'),(7,'Sofia Morales'),(8,'Diego Castillo'),(9,'Laura Flores'),(10,'Jose Cruz'),
(11,'Marta Diaz'),(12,'Jorge Reyes'),(13,'Elena Castro'),(14,'Ricardo Vega'),(15,'Paola Ortiz'),
(16,'Fernando Rivas'),(17,'Daniela Soto'),(18,'Roberto Luna'),(19,'Andrea Silva'),(20,'Mario Campos'),
(21,'Patricia Mendez'),(22,'Alberto Navarro'),(23,'Lucia Herrera'),(24,'Victor Pineda'),(25,'Carmen Salazar');

insert into empleado values
(1,'Ana'),(2,'Luis'),(3,'Pedro'),(4,'Sofia'),(5,'Carlos'),
(6,'Maria'),(7,'Jorge'),(8,'Laura'),(9,'Diego'),(10,'Elena'),
(11,'Ricardo'),(12,'Paola'),(13,'Fernando'),(14,'Daniela'),(15,'Roberto'),
(16,'Andrea'),(17,'Mario'),(18,'Patricia'),(19,'Alberto'),(20,'Lucia'),
(21,'Victor'),(22,'Carmen'),(23,'Raul'),(24,'Diana'),(25,'Oscar');

insert into compra values
(1,'2024-01-01',1,1),(2,'2024-01-02',2,2),(3,'2024-01-03',3,3),
(4,'2024-01-04',4,4),(5,'2024-01-05',5,5),(6,'2024-01-06',6,6),
(7,'2024-01-07',7,7),(8,'2024-01-08',8,8),(9,'2024-01-09',9,9),
(10,'2024-01-10',10,10),(11,'2024-01-11',11,11),(12,'2024-01-12',12,12),
(13,'2024-01-13',13,13),(14,'2024-01-14',14,14),(15,'2024-01-15',15,15),
(16,'2024-01-16',16,16),(17,'2024-01-17',17,17),(18,'2024-01-18',18,18),
(19,'2024-01-19',19,19),(20,'2024-01-20',20,20),(21,'2024-01-21',21,21),
(22,'2024-01-22',22,22),(23,'2024-01-23',23,23),(24,'2024-01-24',24,24),
(25,'2024-01-25',25,25);

insert into detalle_compra values
(1,2,11.00,1,1),(2,1,21.00,2,2),(3,3,6.00,3,3),
(4,2,16.00,4,4),(5,1,55.00,5,5),(6,4,9.50,6,6),
(7,2,13.00,7,7),(8,1,23.00,8,8),(9,2,19.50,9,9),
(10,1,32.00,10,10),(11,3,10.50,11,11),(12,2,15.00,12,12),
(13,1,8.50,13,13),(14,2,12.50,14,14),(15,1,65.00,15,15),
(16,2,17.00,16,16),(17,1,14.00,17,17),(18,3,20.50,18,18),
(19,2,27.00,19,19),(20,1,7.50,20,20),(21,3,5.00,21,21),
(22,2,4.20,22,22),(23,1,13.50,23,23),(24,2,3.50,24,24),
(25,1,2.00,25,25);

insert into historial_stock values
(1,'entrada',50,'Ingreso inicial','2024-01-01',1),
(2,'salida',10,'Venta','2024-01-02',2),
(3,'entrada',30,'Reposicion','2024-01-03',3),
(4,'salida',5,'Venta','2024-01-04',4),
(5,'entrada',20,'Compra proveedor','2024-01-05',5),
(6,'salida',8,'Venta','2024-01-06',6),
(7,'entrada',15,'Reposicion','2024-01-07',7),
(8,'salida',6,'Venta','2024-01-08',8),
(9,'entrada',25,'Compra','2024-01-09',9),
(10,'salida',7,'Venta','2024-01-10',10),
(11,'entrada',18,'Reposicion','2024-01-11',11),
(12,'salida',9,'Venta','2024-01-12',12),
(13,'entrada',22,'Compra','2024-01-13',13),
(14,'salida',4,'Venta','2024-01-14',14),
(15,'entrada',40,'Compra','2024-01-15',15),
(16,'salida',3,'Venta','2024-01-16',16),
(17,'entrada',28,'Reposicion','2024-01-17',17),
(18,'salida',6,'Venta','2024-01-18',18),
(19,'entrada',19,'Compra','2024-01-19',19),
(20,'salida',2,'Venta','2024-01-20',20),
(21,'entrada',33,'Reposicion','2024-01-21',21),
(22,'salida',5,'Venta','2024-01-22',22),
(23,'entrada',27,'Compra','2024-01-23',23),
(24,'salida',4,'Venta','2024-01-24',24),
(25,'entrada',35,'Compra','2024-01-25',25);

insert into producto_proveedor values
(1,1,8.00),(2,2,15.00),(3,3,4.00),(4,4,12.00),(5,5,40.00),
(6,6,6.50),(7,7,9.00),(8,8,18.00),(9,9,14.00),(10,10,25.00),
(11,11,7.00),(12,12,11.00),(13,13,5.00),(14,14,8.00),(15,15,50.00),
(16,16,13.00),(17,17,10.00),(18,18,16.00),(19,19,20.00),(20,20,5.00),
(21,21,3.00),(22,22,2.50),(23,23,9.00),(24,24,1.80),(25,25,1.00);

select * from categoria;