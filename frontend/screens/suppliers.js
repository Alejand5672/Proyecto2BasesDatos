export function renderSuppliers({ getSuppliers, money, $ }) {
  $("#supplierGrid").innerHTML = getSuppliers()
    .slice(0, 12)
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
