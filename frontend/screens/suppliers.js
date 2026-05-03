export function renderSuppliers({ state, money, $ }) {
  $("#supplierGrid").innerHTML = state.suppliers
    .map(
      (item) => `
        <article class="supplier-card">
          <strong>${item.supplier}</strong>
          <small>${item.product} - compra ${money(Number(item.buyPrice))}</small>
        </article>
      `
    )
    .join("");
}
