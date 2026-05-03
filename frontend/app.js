import { renderDashboard } from "./screens/dashboard.js";
import { renderProducts } from "./screens/products.js";
import { renderPurchases } from "./screens/purchases.js";
import { renderReports } from "./screens/reports.js";
import { renderSuppliers } from "./screens/suppliers.js";

const state = {
  categories: [],
  clients: [],
  employees: [],
  products: [],
  purchases: [],
  dashboard: {
    productCount: 0,
    purchaseCount: 0,
    salesTotal: 0,
    criticalStock: 0,
    salesByCategory: [],
    lowStock: [],
    movements: [],
  },
  reports: {
    cards: [],
    topProducts: [],
    topClients: [],
  },
  suppliers: [],
  user: null,
  loading: true,
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
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function statusPill(stock) {
  if (stock < 60) return '<span class="pill danger">Bajo</span>';
  if (stock > 140) return '<span class="pill success">Alto</span>';
  return '<span class="pill neutral">Normal</span>';
}

function fillSelect(select, options, getValue = (item) => item.id, getLabel = (item) => item.nombre || item.name) {
  select.innerHTML = options
    .map((item) => `<option value="${getValue(item)}">${getLabel(item)}</option>`)
    .join("");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la operacion.");
  }
  return data;
}

function setAuthenticated(user) {
  state.user = user;
  document.body.classList.toggle("authenticated", Boolean(user));
}

async function loadData() {
  try {
    state.loading = true;
    renderApp();
    const [catalogs, products, purchases, dashboard, reports, suppliers] = await Promise.all([
      api("/api/catalogs"),
      api("/api/products"),
      api("/api/purchases"),
      api("/api/dashboard"),
      api("/api/reports"),
      api("/api/suppliers"),
    ]);

    state.categories = catalogs.categories;
    state.clients = catalogs.clients;
    state.employees = catalogs.employees;
    state.products = products;
    state.purchases = purchases;
    state.dashboard = dashboard;
    state.reports = reports;
    state.suppliers = suppliers;
    state.loading = false;
    renderApp();
    clearProductForm();
    clearPurchaseForm();
  } catch (error) {
    state.loading = false;
    if (error.message.includes("iniciar sesion")) {
      setAuthenticated(null);
    } else {
      showToast(`Backend no disponible: ${error.message}`);
    }
    renderApp();
  }
}

async function checkSession() {
  const { user } = await api("/api/auth/me");
  setAuthenticated(user);
  if (user) {
    await loadData();
  }
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

function renderApp() {
  const context = {
    state,
    money,
    statusPill,
    getFilteredProducts,
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
  fillSelect($("#productCategory"), state.categories);
  fillSelect($("#purchaseClient"), state.clients);
  fillSelect($("#purchaseEmployee"), state.employees);
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
  $("#productCategory").value = state.categories[0]?.id || "";
  $("#productPrice").value = "";
  $("#productStock").value = "";
  $("#productError").textContent = "";
}

function clearPurchaseForm() {
  $("#purchaseId").value = "";
  $("#purchaseFormTitle").textContent = "Registrar compra";
  $("#purchaseClient").value = state.clients[0]?.id || "";
  $("#purchaseEmployee").value = state.employees[0]?.id || "";
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

async function handleProductSubmit(event) {
  event.preventDefault();
  const id = Number($("#productId").value);
  const payload = {
    name: $("#productName").value.trim(),
    categoryId: Number($("#productCategory").value),
    price: Number($("#productPrice").value),
    stock: Number($("#productStock").value),
  };

  if (!payload.name || !payload.categoryId || payload.price <= 0 || payload.stock < 0) {
    $("#productError").textContent = "Revisa nombre, categoria, precio y stock antes de guardar.";
    return;
  }

  try {
    if (id) {
      await api(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Producto actualizado.");
    } else {
      await api("/api/products", { method: "POST", body: JSON.stringify(payload) });
      showToast("Producto creado.");
    }
    await loadData();
  } catch (error) {
    $("#productError").textContent = error.message;
  }
}

async function handlePurchaseSubmit(event) {
  event.preventDefault();
  const id = Number($("#purchaseId").value);
  const payload = {
    clientId: Number($("#purchaseClient").value),
    employeeId: Number($("#purchaseEmployee").value),
    productId: Number($("#purchaseProduct").value),
    quantity: Number($("#purchaseQuantity").value),
    price: Number($("#purchasePrice").value),
  };

  if (!payload.clientId || !payload.employeeId || !payload.productId || payload.quantity < 1 || payload.price <= 0) {
    $("#purchaseError").textContent = "Completa cliente, empleado, producto, cantidad y precio valido.";
    return;
  }

  try {
    if (id) {
      await api(`/api/purchases/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Compra actualizada.");
    } else {
      await api("/api/purchases", { method: "POST", body: JSON.stringify(payload) });
      showToast("Compra guardada y stock actualizado.");
    }
    await loadData();
  } catch (error) {
    $("#purchaseError").textContent = error.message;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  $("#loginError").textContent = "";

  try {
    const { user } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: $("#loginUser").value,
        password: $("#loginPassword").value,
      }),
    });
    setAuthenticated(user);
    showToast(`Bienvenido, ${user.nombre}.`);
    await loadData();
  } catch (error) {
    $("#loginError").textContent = error.message;
  }
}

async function handleLogout() {
  await api("/api/auth/logout", { method: "POST" });
  setAuthenticated(null);
  showToast("Sesion cerrada.");
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === Number(id));
  if (!product) return;
  $("#productId").value = product.id;
  $("#productFormTitle").textContent = "Editar producto";
  $("#productName").value = product.name;
  $("#productCategory").value = product.categoryId;
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
  $("#purchaseClient").value = purchase.clientId;
  $("#purchaseEmployee").value = purchase.employeeId;
  $("#purchaseProduct").value = purchase.productId;
  $("#purchaseQuantity").value = purchase.quantity;
  $("#purchasePrice").value = purchase.price;
  $("#purchaseError").textContent = "";
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
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
      try {
        await api(`/api/products/${productDelete.dataset.deleteProduct}`, { method: "DELETE" });
        showToast("Producto eliminado.");
        await loadData();
      } catch (error) {
        showToast(error.message);
      }
    }

    const purchaseEdit = event.target.closest("[data-edit-purchase]");
    if (purchaseEdit) editPurchase(purchaseEdit.dataset.editPurchase);

    const purchaseDelete = event.target.closest("[data-delete-purchase]");
    if (purchaseDelete) {
      try {
        await api(`/api/purchases/${purchaseDelete.dataset.deletePurchase}`, { method: "DELETE" });
        showToast("Compra eliminada y stock restaurado.");
        await loadData();
      } catch (error) {
        showToast(error.message);
      }
    }
  });

  $("#menuButton").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  $("#loginForm").addEventListener("submit", handleLogin);
  $("#logoutButton").addEventListener("click", handleLogout);
  $("#productForm").addEventListener("submit", handleProductSubmit);
  $("#purchaseForm").addEventListener("submit", handlePurchaseSubmit);
  $("#clearProductForm").addEventListener("click", clearProductForm);
  $("#clearPurchaseForm").addEventListener("click", clearPurchaseForm);
  $("#newProductButton").addEventListener("click", clearProductForm);
  $("#newPurchaseButton").addEventListener("click", clearPurchaseForm);

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
bindEvents();
setRoute(location.hash.replace("#", "") || "dashboard");
checkSession();
