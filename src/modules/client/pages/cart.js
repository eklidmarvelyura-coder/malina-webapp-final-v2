// src/modules/client/pages/cart.js
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { ProductCard } from "../../../shared/components/productCard.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";

export function renderCartPage(ctx) {
  const { store, tg } = ctx;
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="page glass cart-page">
      <div class="page-header">
        <div class="header-left">
          <h1>🍓 Malina Cafe</h1>
          <p class="muted">Корзина</p>
        </div>
      </div>

      <div id="cartBody"></div>

      <div class="cart-footer glass">
        <div class="cart-total-row">
          <span class="muted">Итого</span>
          <strong id="cartTotal">0 ฿</strong>
        </div>
        <button class="primary" id="checkoutBtn">Оформить заказ</button>
      </div>
    </div>
  `;

  const cartBody = content.querySelector("#cartBody");
  const cartTotal = content.querySelector("#cartTotal");
  const checkoutBtn = content.querySelector("#checkoutBtn");

  function render() {
    const items = store.cart.selectors.items();
    const ids = Object.keys(items).map(Number);

    if (ids.length === 0) {
      cartBody.innerHTML = `
        <div class="empty glass">
          <h3>Корзина пустая</h3>
          <p class="muted">Добавьте товары в меню</p>
        </div>
      `;
      cartTotal.textContent = "0 ฿";
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = "0.6";
      return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = "1";

    cartBody.innerHTML = `
      <div class="grid cart-grid" id="cartGrid">
        ${ids
          .map((id) => {
            const product = PRODUCT_BY_ID[id];
            const count = items[id];
            if (!product) return "";
            return ProductCard({ product, count, mode: "cart" });
          })
          .join("")}
      </div>
    `;

    cartTotal.textContent = `${calcCartTotal(items, PRODUCT_BY_ID)} ฿`;

    const grid = cartBody.querySelector("#cartGrid");
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      if (!card) return;

      const id = Number(card.dataset.id);
      const action = e.target.closest("[data-action]")?.dataset?.action;

      if (action === "add") store.cart.actions.add(id);
      if (action === "remove") store.cart.actions.remove(id);
    });
  }

  store.subscribe(render);
  render();

  checkoutBtn.onclick = () => {
    const total = calcCartTotal(store.cart.selectors.items(), PRODUCT_BY_ID);
    if (total <= 0) return tg.showAlert("Корзина пустая");
    tg.showAlert("Следующий шаг: оформление заказа (адрес/телефон/коммент) ✅");
  };
}
