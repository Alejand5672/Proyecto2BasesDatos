export function renderProducts({ getFilteredProducts, money, $ }) {
  const rows = getFilteredProducts()
    .map(
      (product) => `
        <tr>
          <td>${product.id}</td>
          <td><strong>${product.name}</strong></td>
          <td>${product.category}</td>
          <td>${product.stock}</td>
          <td>${money(product.price)}</td>
          <td>
            <div class="row-actions">
              <button class="tiny-button" type="button" data-edit-product="${product.id}">Editar</button>
              <button class="tiny-button delete" type="button" data-delete-product="${product.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  $("#productRows").innerHTML =
    rows || '<tr><td colspan="6">No hay productos que coincidan con la busqueda.</td></tr>';
}
