export function renderSuppliers({ state, money, $ }) {
  $("#supplierGrid").innerHTML = state.suppliers
    .map(
      (item) => `
        <article class="supplier-card">
          <strong>${item.supplier}</strong>
          <small>${item.product} - ${item.category}</small>
          <small>Stock ${item.stock} · compra ${money(Number(item.buyPrice))}</small>
        </article>
      `
    )
    .join("") || '<article class="supplier-card"><strong>Sin proveedores</strong><small>No hay relaciones registradas.</small></article>';
}
