// src/modules/client/pages/nav.js
// Навигация клиента + нижняя “карточка корзины”.
// Важно: nav подписывается на store и сам обновляет сумму.

import { navigate } from "../../../shared/router.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";

export function renderClientNav(sidebar, ctx) {
  const { store } = ctx;

  sidebar.innerHTML = `
    <div class="nav-top">
      <div class="brand-badge">🍓</div>

      <button class="nav-btn" data-go="menu" title="Меню">🍽</button>
      <button class="nav-btn" data-go="cart" title="Корзина">🛒</button>
      <button class="nav-btn" data-go="feedback" title="Связь">💬</button>
    </div>

    <div class="nav-bottom">
      <!-- “стеклянная” карточка корзины -->
      <div class="cart-mini glass" id="cartMini" role="button" tabindex="0">
        <div class="cart-mini-row">
          <span class="cart-mini-title">Корзина</span>
          <span class="cart-mini-count" id="cartMiniCount">0</span>
        </div>
        <div class="cart-mini-sum" id="cartMiniSum">0 ฿</div>
        <div class="cart-mini-hint">нажми, чтобы открыть</div>
      </div>
    </div>
  `;

  // Навигация
  sidebar.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.go, ctx));
  });

  // Клик по мини-корзине открывает страницу корзины
  const cartMini = sidebar.querySelector("#cartMini");
  cartMini.addEventListener("click", () => navigate("cart", ctx));
  cartMini.addEventListener("keydown", (e) => {
    if (e.key === "Enter") navigate("cart", ctx);
  });

  // --- Самое важное: подписка на store ---
  // Теперь сумма/счётчик будут реагировать на +/−.
  const elCount = sidebar.querySelector("#cartMiniCount");
  const elSum = sidebar.querySelector("#cartMiniSum");

  function renderCartMini() {
    const items = store.cart.selectors.items();
    elCount.textContent = String(store.cart.selectors.countAll());
    elSum.textContent = `${calcCartTotal(items, PRODUCT_BY_ID)} ฿`;
  }

  renderCartMini();
  store.subscribe(renderCartMini);
}
