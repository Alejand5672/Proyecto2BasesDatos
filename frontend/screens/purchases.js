export function renderPurchases({ state, money, $, canManagePurchases }) {
  const canManage = canManagePurchases();
  $("#newPurchaseButton").hidden = !canManage;
  $("#purchaseForm").closest(".form-panel").hidden = !canManage;

  $("#purchaseRows").innerHTML = state.purchases
    .map((purchase) => {
      const total = purchase.total || purchase.quantity * purchase.price;
      return `
        <tr>
          <td>${purchase.id}</td>
          <td>${String(purchase.fecha || purchase.date).slice(0, 10)}</td>
          <td>${purchase.client}</td>
          <td>${purchase.product}</td>
          <td>${purchase.quantity}</td>
          <td>${purchase.employee}</td>
          <td>${money(total)}</td>
          <td>
            ${
              canManage
                ? `<div class="row-actions">
                    <button class="tiny-button" type="button" data-edit-purchase="${purchase.id}">Editar</button>
                    <button class="tiny-button delete" type="button" data-delete-purchase="${purchase.id}">Eliminar</button>
                  </div>`
                : '<span class="pill neutral">Solo lectura</span>'
            }
          </td>
        </tr>
      `;
    })
    .join("");
}
