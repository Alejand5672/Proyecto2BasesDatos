export function renderDashboard({ state, money, statusPill, $ }) {
  const dashboard = state.dashboard;

  $("#metricsGrid").innerHTML = [
    ["Ventas registradas", money(dashboard.salesTotal), `${dashboard.purchaseCount} compras registradas`],
    ["Productos activos", dashboard.productCount, "Catalogo conectado a la base de datos"],
    ["Stock critico", dashboard.criticalStock, "Productos con menos de 60 unidades", "warning"],
    ["Secciones activas", "2", "Productos y compras"],
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

  const categorySales = dashboard.salesByCategory || [];
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
    .join("") || "<p class=\"empty-state\">Sin ventas registradas todavia.</p>";

  $("#activityList").innerHTML = (dashboard.movements || [])
    .map(
      (movement) => `
        <li>
          <span class="pill ${movement.type === "Entrada" ? "success" : "danger"}">${movement.type}</span>
          <strong>${movement.product}</strong>
          <small>${movement.detail}</small>
        </li>
      `
    )
    .join("") || "<li><strong>Sin movimientos</strong><small>Registra compras para ver actividad.</small></li>";

  $("#lowStockRows").innerHTML = (dashboard.lowStock || [])
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
    .join("") || '<tr><td colspan="5">No hay productos bajo seguimiento.</td></tr>';
}
