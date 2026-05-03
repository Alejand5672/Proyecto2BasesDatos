export function renderDashboard({ state, movements, money, statusPill, salesByCategory, lowStockProducts, $ }) {
  const salesTotal = state.purchases.reduce((sum, purchase) => sum + purchase.quantity * purchase.price, 0);
  const lowStockCount = state.products.filter((product) => product.stock < 60).length;

  $("#metricsGrid").innerHTML = [
    ["Ventas registradas", money(salesTotal), `${state.purchases.length} compras en datos de prueba`],
    ["Productos activos", state.products.length, `${new Set(state.products.map((p) => p.category)).size} categorias`],
    ["Stock critico", lowStockCount, "Productos con menos de 60 unidades", "warning"],
    ["CRUD requeridos", "2", "Productos y compras"],
  ]
    .map(
      ([label, value, help, tone]) => `
        <article class="metric-card ${tone || ""}">
          <span class="metric-label">${label}</span>
          <strong>${value}</strong>
          <small>${help}</small>
        </article>
      `
    )
    .join("");

  const categorySales = salesByCategory();
  const max = Math.max(...categorySales.map((item) => item.total), 1);
  $("#salesByCategoryChart").innerHTML = categorySales
    .map(
      (item) => `
        <div style="--value: ${(item.total / max) * 100}">
          <span>${item.category}</span>
          <strong>${money(item.total)}</strong>
        </div>
      `
    )
    .join("");

  $("#activityList").innerHTML = movements
    .map(
      (movement) => `
        <li>
          <span class="pill ${movement.type === "Entrada" ? "success" : "danger"}">${movement.type}</span>
          <strong>${movement.product}</strong>
          <small>${movement.detail}</small>
        </li>
      `
    )
    .join("");

  $("#lowStockRows").innerHTML = lowStockProducts()
    .map(
      (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${product.stock}</td>
          <td>${money(product.price)}</td>
          <td>${statusPill(product.stock)}</td>
        </tr>
      `
    )
    .join("");
}
