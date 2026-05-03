import { renderDashboard } from "./screens/dashboard.js";
import { renderProducts } from "./screens/products.js";
import { renderPurchases } from "./screens/purchases.js";
import { renderReports } from "./screens/reports.js";
import { renderSuppliers } from "./screens/suppliers.js";

const categories = [
  "Electronica",
  "Ropa",
  "Alimentos",
  "Hogar",
  "Deportes",
  "Juguetes",
  "Libros",
  "Belleza",
  "Automotriz",
  "Mascotas",
  "Tecnologia",
  "Oficina",
  "Salud",
  "Accesorios",
  "Calzado",
  "Herramientas",
  "Jardin",
  "Musica",
  "Videojuegos",
  "Bebidas",
  "Panaderia",
  "Lacteos",
  "Carnes",
  "Frutas",
  "Verduras",
];

const clients = [
  "Juan Perez",
  "Maria Lopez",
  "Carlos Ruiz",
  "Ana Gomez",
  "Luis Torres",
  "Pedro Ramirez",
  "Sofia Morales",
  "Diego Castillo",
  "Laura Flores",
  "Jose Cruz",
];

const employees = ["Ana", "Luis", "Pedro", "Sofia", "Carlos", "Maria", "Jorge", "Laura"];

const movements = [
  { type: "Entrada", product: "Producto 25", detail: "Compra proveedor - 35 unidades" },
  { type: "Salida", product: "Producto 24", detail: "Venta - 4 unidades" },
  { type: "Entrada", product: "Producto 23", detail: "Reposicion - 27 unidades" },
  { type: "Salida", product: "Producto 22", detail: "Venta - 5 unidades" },
];

const reportRequirements = [
  ["JOIN", "Ventas por producto y categoria", "Producto, categoria, cantidad vendida, total facturado y empleado."],
  ["SUBQUERY", "Productos bajo el promedio de stock", "Detecta inventario con menor disponibilidad."],
  ["GROUP BY + HAVING", "Categorias con ventas mayores a Q 25", "Agrupa ventas por categoria y filtra con HAVING."],
  ["CTE", "Ranking de clientes por consumo", "WITH para calcular totales por cliente antes de ordenar."],
  ["VIEW", "Vista de resumen de ventas", "El backend podra alimentar esta tabla desde una vista SQL."],
  ["TRANSACCION", "Compra con actualizacion de stock", "Flujo preparado para BEGIN, COMMIT y ROLLBACK."],
];

const sqlSnippet = `WITH ventas_cliente AS (
  SELECT c.id_cliente, c.nombre, SUM(dc.cantidad * dc.precio_venta) AS total
  FROM cliente c
  JOIN compra co ON co.id_cliente = c.id_cliente
  JOIN detalle_compra dc ON dc.id_compra = co.id_compra
  GROUP BY c.id_cliente, c.nombre
)
SELECT * FROM ventas_cliente ORDER BY total DESC;`;

const state = {
  products: Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    name: `Producto ${index + 1}`,
    category: categories[index],
    price: [
      10.5, 20, 5.75, 15.3, 50, 8.9, 12.4, 22.1, 18.6, 30, 9.99, 14.25, 7.8,
      11, 60, 16.4, 13.5, 19.99, 25, 6.75, 4.5, 3.8, 12.6, 2.9, 1.5,
    ][index],
    stock: [
      100, 80, 200, 60, 40, 150, 90, 70, 55, 45, 110, 95, 120, 130, 20, 75, 85,
      65, 50, 140, 160, 170, 95, 180, 200,
    ][index],
  })),
  purchases: Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    date: `2024-01-${String(index + 1).padStart(2, "0")}`,
    client: clients[index],
    employee: employees[index % employees.length],
    productId: index + 1,
    quantity: [2, 1, 3, 2, 1, 4, 2, 1, 2, 1][index],
    price: [11, 21, 6, 16, 55, 9.5, 13, 23, 19.5, 32][index],
  })),
  productFilter: "todos",
  search: "",
};

const formatter = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function money(value) {
  return formatter.format(Number(value || 0)).replace("GTQ", "Q");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function statusPill(stock) {
  if (stock < 60) return '<span class="pill danger">Bajo</span>';
  if (stock > 140) return '<span class="pill success">Alto</span>';
  return '<span class="pill neutral">Normal</span>';
}

function fillSelect(select, options, getValue = (item) => item, getLabel = (item) => item) {
  select.innerHTML = options
    .map((item) => `<option value="${getValue(item)}">${getLabel(item)}</option>`)
    .join("");
}

function getSuppliers() {
  return state.products.map((product) => ({
    product: product.name,
    supplier: `Proveedor ${String.fromCharCode(64 + ((product.id - 1) % 25) + 1)}`,
    buyPrice: Math.max(product.price * 0.78, 1).toFixed(2),
  }));
}

function getFilteredProducts() {
  return state.products.filter((product) => {
    const matchesFilter =
      state.productFilter === "todos" ||
      (state.productFilter === "bajo" && product.stock < 60) ||
      (state.productFilter === "alto" && product.stock > 140);
    const searchable = `${product.name} ${product.category}`.toLowerCase();
    return matchesFilter && searchable.includes(state.search.toLowerCase());
  });
}

function salesByCategory() {
  const totals = new Map();
  state.purchases.forEach((purchase) => {
    const product = state.products.find((item) => item.id === Number(purchase.productId));
    if (!product) return;
    totals.set(product.category, (totals.get(product.category) || 0) + purchase.quantity * purchase.price);
  });

  return Array.from(totals, ([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function lowStockProducts() {
  const average =
    state.products.reduce((sum, product) => sum + Number(product.stock), 0) / state.products.length;
  return state.products
    .filter((product) => product.stock < average)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);
}

function renderApp() {
  const context = {
    state,
    categories,
    clients,
    employees,
    movements,
    reportRequirements,
    money,
    statusPill,
    getFilteredProducts,
    getSuppliers,
    salesByCategory,
    lowStockProducts,
    $,
  };

  refreshFormOptions();
  renderDashboard(context);
  renderProducts(context);
  renderPurchases(context);
  renderReports(context);
  renderSuppliers(context);
}

function refreshFormOptions() {
  fillSelect($("#productCategory"), categories);
  fillSelect($("#purchaseClient"), clients);
  fillSelect($("#purchaseEmployee"), employees);
  fillSelect(
    $("#purchaseProduct"),
    state.products,
    (product) => product.id,
    (product) => `${product.name} (${product.stock} disp.)`
  );
}

function clearProductForm() {
  $("#productId").value = "";
  $("#productFormTitle").textContent = "Crear producto";
  $("#productName").value = "";
  $("#productCategory").value = categories[0];
  $("#productPrice").value = "";
  $("#productStock").value = "";
  $("#productError").textContent = "";
}

function clearPurchaseForm() {
  $("#purchaseId").value = "";
  $("#purchaseFormTitle").textContent = "Registrar compra";
  $("#purchaseClient").value = clients[0] || "";
  $("#purchaseEmployee").value = employees[0] || "";
  $("#purchaseProduct").value = state.products[0]?.id || "";
  $("#purchaseQuantity").value = 1;
  $("#purchasePrice").value = state.products[0]?.price || "";
  $("#purchaseError").textContent = "";
}

function setRoute(route) {
  const target = route || "dashboard";
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === target));
  $$(".nav-item, .text-link, .brand").forEach((item) =>
    item.classList.toggle("active", item.dataset.nav === target)
  );
  const activeView = $(`#${target}`);
  $("#pageTitle").textContent = activeView?.dataset.title || "Inicio";
  document.body.classList.remove("sidebar-open");
}

function handleProductSubmit(event) {
  event.preventDefault();
  const id = Number($("#productId").value);
  const name = $("#productName").value.trim();
  const category = $("#productCategory").value;
  const price = Number($("#productPrice").value);
  const stock = Number($("#productStock").value);

  if (!name || !category || Number.isNaN(price) || price <= 0 || Number.isNaN(stock) || stock < 0) {
    $("#productError").textContent = "Revisa nombre, categoria, precio y stock antes de guardar.";
    return;
  }

  if (id) {
    state.products = state.products.map((product) =>
      product.id === id ? { ...product, name, category, price, stock } : product
    );
    showToast("Producto actualizado.");
  } else {
    state.products.push({
      id: Math.max(0, ...state.products.map((product) => product.id)) + 1,
      name,
      category,
      price,
      stock,
    });
    showToast("Producto creado.");
  }

  clearProductForm();
  renderApp();
}

function handlePurchaseSubmit(event) {
  event.preventDefault();
  const id = Number($("#purchaseId").value);
  const client = $("#purchaseClient").value;
  const employee = $("#purchaseEmployee").value;
  const productId = Number($("#purchaseProduct").value);
  const quantity = Number($("#purchaseQuantity").value);
  const price = Number($("#purchasePrice").value);
  const product = state.products.find((item) => item.id === productId);

  if (!client || !employee || !product || quantity < 1 || price <= 0) {
    $("#purchaseError").textContent = "Completa cliente, empleado, producto, cantidad y precio valido.";
    return;
  }

  if (!id && product.stock < quantity) {
    $("#purchaseError").textContent = "No hay stock suficiente. En backend esto debe hacer ROLLBACK.";
    return;
  }

  if (id) {
    state.purchases = state.purchases.map((purchase) =>
      purchase.id === id ? { ...purchase, client, employee, productId, quantity, price } : purchase
    );
    showToast("Compra actualizada.");
  } else {
    state.purchases.push({
      id: Math.max(0, ...state.purchases.map((purchase) => purchase.id)) + 1,
      date: new Date().toISOString().slice(0, 10),
      client,
      employee,
      productId,
      quantity,
      price,
    });
    state.products = state.products.map((item) =>
      item.id === productId ? { ...item, stock: item.stock - quantity } : item
    );
    showToast("Compra guardada y stock actualizado.");
  }

  clearPurchaseForm();
  renderApp();
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === Number(id));
  if (!product) return;
  $("#productId").value = product.id;
  $("#productFormTitle").textContent = "Editar producto";
  $("#productName").value = product.name;
  $("#productCategory").value = product.category;
  $("#productPrice").value = product.price;
  $("#productStock").value = product.stock;
  $("#productError").textContent = "";
  $("#productFormPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function editPurchase(id) {
  const purchase = state.purchases.find((item) => item.id === Number(id));
  if (!purchase) return;
  $("#purchaseId").value = purchase.id;
  $("#purchaseFormTitle").textContent = "Editar compra";
  $("#purchaseClient").value = purchase.client;
  $("#purchaseEmployee").value = purchase.employee;
  $("#purchaseProduct").value = purchase.productId;
  $("#purchaseQuantity").value = purchase.quantity;
  $("#purchasePrice").value = purchase.price;
  $("#purchaseError").textContent = "";
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const navItem = event.target.closest("[data-nav]");
    if (navItem) {
      event.preventDefault();
      history.replaceState(null, "", `#${navItem.dataset.nav}`);
      setRoute(navItem.dataset.nav);
    }

    const productEdit = event.target.closest("[data-edit-product]");
    if (productEdit) editProduct(productEdit.dataset.editProduct);

    const productDelete = event.target.closest("[data-delete-product]");
    if (productDelete) {
      const id = Number(productDelete.dataset.deleteProduct);
      state.products = state.products.filter((product) => product.id !== id);
      state.purchases = state.purchases.filter((purchase) => purchase.productId !== id);
      renderApp();
      showToast("Producto eliminado de la vista.");
    }

    const purchaseEdit = event.target.closest("[data-edit-purchase]");
    if (purchaseEdit) editPurchase(purchaseEdit.dataset.editPurchase);

    const purchaseDelete = event.target.closest("[data-delete-purchase]");
    if (purchaseDelete) {
      state.purchases = state.purchases.filter(
        (purchase) => purchase.id !== Number(purchaseDelete.dataset.deletePurchase)
      );
      renderApp();
      showToast("Compra eliminada de la vista.");
    }
  });

  $("#menuButton").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  $("#productForm").addEventListener("submit", handleProductSubmit);
  $("#purchaseForm").addEventListener("submit", handlePurchaseSubmit);
  $("#clearProductForm").addEventListener("click", clearProductForm);
  $("#clearPurchaseForm").addEventListener("click", clearPurchaseForm);
  $("#newProductButton").addEventListener("click", clearProductForm);
  $("#newPurchaseButton").addEventListener("click", clearPurchaseForm);
  $("#copySqlButton").addEventListener("click", async () => {
    await navigator.clipboard.writeText(sqlSnippet);
    showToast("Consulta CTE copiada.");
  });

  $("#globalSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderApp();
  });

  $$(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.productFilter = chip.dataset.filter;
      $$(".chip").forEach((item) => item.classList.toggle("active", item === chip));
      renderApp();
    });
  });

  $("#purchaseProduct").addEventListener("change", (event) => {
    const product = state.products.find((item) => item.id === Number(event.target.value));
    $("#purchasePrice").value = product?.price || "";
  });
}

renderApp();
clearProductForm();
clearPurchaseForm();
bindEvents();
setRoute(location.hash.replace("#", "") || "dashboard");
