export function renderProducts({ getFilteredProducts, money, $, canManageProducts }) {
  const canManage = canManageProducts();
  $("#newProductButton").hidden = !canManage;
  $("#productFormPanel").hidden = !canManage;

  const rows = getFilteredProducts()
    .map(
      (product) => `
        <tr>
          <td>${product.id}</td>
          <td><strong>${product.name}</strong></td>
          <td>${product.category}</td>
          <td>${product.supplier || "Sin proveedor"}</td>
          <td>${product.stock}</td>
          <td>${money(product.buyPrice)}</td>
          <td>${money(product.price)}</td>
          <td>
            ${
              canManage
                ? `<div class="row-actions">
                    <button class="tiny-button" type="button" data-edit-product="${product.id}">Editar</button>
                    <button class="tiny-button delete" type="button" data-delete-product="${product.id}">Eliminar</button>
                  </div>`
                : '<span class="pill neutral">Solo lectura</span>'
            }
          </td>
        </tr>
      `
    )
    .join("");

  $("#productRows").innerHTML =
    rows || '<tr><td colspan="8">No hay productos que coincidan con la busqueda.</td></tr>';
}
