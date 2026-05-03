export function renderReports({ state, money, $ }) {
  $("#reportCards").innerHTML = (state.reports.cards || [])
    .map(
      (card) => `
        <article class="report-card">
          <span class="report-tag">${card.value}</span>
          <h3>${card.title}</h3>
          <p>${card.detail}</p>
        </article>
      `
    )
    .join("") || '<article class="report-card"><h3>Sin datos</h3><p>Conecta la base de datos para ver reportes.</p></article>';

  $("#reportRows").innerHTML = (state.reports.topProducts || [])
    .map((product) => `
        <tr>
          <td>${product.producto}</td>
          <td>${product.categoria}</td>
          <td>${product.unidades}</td>
          <td>${money(product.total)}</td>
          <td>Registrado</td>
        </tr>
      `)
    .join("") || '<tr><td colspan="5">Sin ventas para mostrar.</td></tr>';
}
