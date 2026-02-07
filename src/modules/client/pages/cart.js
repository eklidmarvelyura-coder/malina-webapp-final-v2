import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { ProductCard } from "../../../shared/components/productCard.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";
import { renderHeader } from "../../../shared/ui/header.js";

export function renderCartPage(ctx) {
  const { store, tg, content } = ctx;

  content.innerHTML = `
    <div class="glass" id="cartHeader"></div>
    <div id="cartBody"></div>

    <div class="cart-footer glass">
      <div class="cart-total-row">
        <span class="muted">Итого</span>
        <strong id="cartTotal">0 ฿</strong>
      </div>
      <button class="primary" id="checkoutBtn">Оформить заказ</button>
    </div>
  `;

  renderHeader(document.getElementById("cartHeader"), { subtitle: "Корзина" });

  const cartBody = document.getElementById("cartBody");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  let gridEl = null;

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
      gridEl = null;
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
    gridEl = document.getElementById("cartGrid");
  }

  const onCartClick = (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    const action = e.target.closest("[data-action]")?.dataset?.action;

    if (action === "add") store.cart.actions.add(id);
    if (action === "remove") store.cart.actions.remove(id);
  };

  // обработчик кликов ставим на content (работает даже при перерисовке cartBody)
  content.addEventListener("click", onCartClick);

  checkoutBtn.onclick = () => {
    const total = calcCartTotal(store.cart.selectors.items(), PRODUCT_BY_ID);
    if (total <= 0) return tg.showAlert("Корзина пустая");
    tg.showAlert("Следующий шаг: оформление заказа ✅");
  };

  const unsub = store.subscribe(render);
  render();

  return () => {
    try { unsub && unsub(); } catch (_) {}
    try { content.removeEventListener("click", onCartClick); } catch (_) {}
  };
}
