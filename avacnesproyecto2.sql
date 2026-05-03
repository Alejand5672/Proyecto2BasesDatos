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
(1,'Celular',2500.00,100,1),(2,'Pantalon Cargo',350.00,80,2),(3,'Arroz',5.75,200,3),
(4,'Lampara',50.00,60,4),(5,'Trionda balon de futbol',100.00,40,5),(6,'Rifle Nerf',150.00,150,6),
(7,'Harry Potter y el caliz de fuego',200.00,90,7),(8,'Labial labello',22.10,70,8),(9,'Aceite liqui moly',40.35,55,9),
(10,'Pechera grande',30.00,45,10),(11,'Cepillo de dientes electrico',45.90,110,11),(12,'Silla con ruedas',249.99,95,12),
(13,'Acetaminofen',7.80,120,13),(14,'Cinturon cuero',40.25,130,14),(15,'Nike AF1',500.00,20,15),
(16,'Clavos',16.40,75,16),(17,'Maceta pequena',13.50,85,17),(18,'Guitarra acustica',399.99,65,18),
(19,'PS5',4999.99,50,19),(20,'Coca cola Lata',6.75,140,20),(21,'Pie pina',4.50,160,21),
(22,'Leche LALA',12.50,170,22),(23,'Lomito Res',42.50,95,23),(24,'Manzana',2.90,180,24),
(25,'Cilantro',1.50,201,25);

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
(1,2,2500.00,1,1),(2,1,350.00,2,2),(3,3,5.75,3,3),
(4,2,50.00,4,4),(5,1,100.00,5,5),(6,4,150.00,6,6),
(7,2,200.00,7,7),(8,1,22.10,8,8),(9,2,40.35,9,9),
(10,1,30.00,10,10),(11,3,45.90,11,11),(12,2,249.99,12,12),
(13,1,7.80,13,13),(14,2,40.25,14,14),(15,1,500.00,15,15),
(16,2,16.40,16,16),(17,1,13.50,17,17),(18,3,399.99,18,18),
(19,2,4999.99,19,19),(20,1,6.75,20,20),(21,3,4.50,21,21),
(22,2,12.50,22,22),(23,1,42.50,23,23),(24,2,2.90,24,24),
(25,1,1.50,25,25);

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
(1,1,1950.00),(2,2,273.00),(3,3,4.49),(4,4,39.00),(5,5,78.00),
(6,6,117.00),(7,7,156.00),(8,8,17.24),(9,9,31.47),(10,10,23.40),
(11,11,35.80),(12,12,194.99),(13,13,6.08),(14,14,31.40),(15,15,390.00),
(16,16,12.79),(17,17,10.53),(18,18,311.99),(19,19,3899.99),(20,20,5.27),
(21,21,3.51),(22,22,9.75),(23,23,33.15),(24,24,2.26),(25,25,1.17);

select * from categoria;
