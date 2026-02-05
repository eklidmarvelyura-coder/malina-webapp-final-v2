import { navigate } from "../../../shared/router.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";

export function renderClientNav(sidebar, ctx) {
  const { store } = ctx;

  sidebar.innerHTML = `
    <div class="nav-top">
      <div class="brand">🍓</div>

      <button class="nav-item" data-go="menu">
        <div class="nav-ico">🍽</div>
        <div class="nav-txt">Меню</div>
      </button>

      <button class="nav-item" data-go="cart">
        <div class="nav-ico">🛒</div>
        <div class="nav-txt">Корзина</div>
      </button>

      <button class="nav-item" data-go="feedback">
        <div class="nav-ico">💬</div>
        <div class="nav-txt">Связь</div>
      </button>
    </div>

    <div class="nav-bottom">
      <div class="cart-widget glass" id="cartWidget">
        <div class="cart-row">
          <span class="cart-label">Товаров:</span>
          <span class="cart-val" id="cartItemsCount">0</span>
        </div>
        <div class="cart-row">
          <span class="cart-label">Сумма:</span>
          <span class="cart-val" id="cartSum">0 ฿</span>
        </div>
        <button class="primary cart-open-btn" id="openCartBtn">Открыть</button>
      </div>
    </div>
  `;

  sidebar.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.go, ctx));
  });

  sidebar.querySelector("#openCartBtn").addEventListener("click", () => navigate("cart", ctx));
  sidebar.querySelector("#cartWidget").addEventListener("click", () => navigate("cart", ctx));

  const elCount = sidebar.querySelector("#cartItemsCount");
  const elSum = sidebar.querySelector("#cartSum");

  function renderWidget() {
    const items = store.cart.selectors.items();
    elCount.textContent = String(store.cart.selectors.countAll());
    elSum.textContent = `${calcCartTotal(items, PRODUCT_BY_ID)} ฿`;
  }

  renderWidget();
  store.subscribe(renderWidget);
}
