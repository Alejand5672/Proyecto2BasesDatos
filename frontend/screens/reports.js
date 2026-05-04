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
    .join("") || '<article class="report-card"><h3>Sin datos</h3><p>Aun no hay informacion para reportes.</p></article>';

  $("#reportSections").innerHTML = (state.reports.sections || [])
    .map(
      (section) => `
        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Reporte</p>
              <h2>${section.title}</h2>
              <small class="panel-detail">${section.detail}</small>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>${section.columns.map((column) => `<th>${column}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${
                  section.rows.length
                    ? section.rows.map((row) => `<tr>${row.map((value, index) => `<td>${formatCell(value, section.columns[index], money)}</td>`).join("")}</tr>`).join("")
                    : `<tr><td colspan="${section.columns.length}">Sin datos para mostrar.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </section>
      `
    )
    .join("");
}

function formatCell(value, column, money) {
  const moneyColumns = ["Total", "Costo", "Precio", "Promedio categoria"];
  if (typeof value === "number" && moneyColumns.includes(column)) return money(value);
  return value ?? "";
}
