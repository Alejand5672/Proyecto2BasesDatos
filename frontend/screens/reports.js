export function renderReports({ state, reportRequirements, money, getSuppliers, $ }) {
  $("#reportCards").innerHTML = reportRequirements
    .map(
      ([tag, title, text]) => `
        <article class="report-card">
          <span class="query-tag">${tag}</span>
          <h3>${title}</h3>
          <p>${text}</p>
        </article>
      `
    )
    .join("");

  const suppliers = getSuppliers();
  $("#reportRows").innerHTML = state.purchases
    .slice()
    .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
    .slice(0, 8)
    .map((purchase) => {
      const product = state.products.find((item) => item.id === Number(purchase.productId));
      const supplier = suppliers.find((item) => item.product === product?.name);
      return `
        <tr>
          <td>${product?.name || "Sin producto"}</td>
          <td>${product?.category || "Sin categoria"}</td>
          <td>${purchase.quantity}</td>
          <td>${money(purchase.quantity * purchase.price)}</td>
          <td>${supplier?.supplier || "Pendiente"}</td>
        </tr>
      `;
    })
    .join("");
}
