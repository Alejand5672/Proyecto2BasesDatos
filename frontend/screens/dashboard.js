export function renderDashboard({ state, money, statusPill, $ }) {
  const dashboard = state.dashboard;

  if (state.loading) {
    $("#metricsGrid").innerHTML = `
      <article class="metric-card"><span class="metric-label">Cargando</span><strong>...</strong><small>Preparando resumen</small></article>
    `;
    $("#salesByCategoryChart").innerHTML = '<p class="empty-state">Cargando ventas...</p>';
    $("#activityList").innerHTML = '<li><strong>Cargando</strong><small>Consultando movimientos.</small></li>';
    $("#lowStockRows").innerHTML = '<tr><td colspan="5">Cargando inventario...</td></tr>';
    return;
  }

  $("#metricsGrid").innerHTML = [
    ["Ventas registradas", money(dashboard.salesTotal), `${dashboard.purchaseCount} compras registradas`],
    ["Productos activos", dashboard.productCount, "Productos disponibles en catalogo"],
    ["Stock critico", dashboard.criticalStock, "Productos con menos de 60 unidades", "warning"],
    ["CRUD implementados", "2", "Productos y compras"],
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
        <article class="sales-category-row" style="--value: ${(item.total / max) * 100}">
          <span class="sales-category-name">${item.category}</span>
          <span class="sales-category-track" aria-hidden="true">
            <span class="sales-category-bar"></span>
          </span>
          <strong class="sales-category-total">${money(item.total)}</strong>
        </article>
      `
    )
    .join("") || `
      <article class="sales-category-row empty">
        <span class="sales-category-name">Sin ventas</span>
        <span class="sales-category-track" aria-hidden="true">
          <span class="sales-category-bar"></span>
        </span>
        <strong class="sales-category-total">${money(0)}</strong>
      </article>
    `;

  $("#salesByCategoryChart").innerHTML += `
    <div class="sales-category-summary">
      <span>Total general</span>
      <strong>${money(dashboard.salesTotal)}</strong>
    </div>
  `;

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
