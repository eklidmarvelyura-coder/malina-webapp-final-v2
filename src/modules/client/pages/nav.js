// src/modules/client/pages/nav.js
// Клиентский sidebar.
// Принципы (важно понять):
// 1) Sidebar — это "вид", он НЕ хранит данные.
// 2) Данные берём из store (cartStore), чтобы всё было синхронно.
// 3) Сайдбар подписывается на store.subscribe(), чтобы сумма обновлялась мгновенно.

import { navigate } from "../../../shared/router.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";

export function renderClientNav(sidebar, ctx) {
  // 1) Рендерим навигацию БЕЗ нижней панели
  sidebar.innerHTML = `
    <div class="nav-top">
      <div class="brand">🍓</div>

      <button class="nav-item" data-route="menu">
        <div class="nav-ico">🍽</div>
        <div class="nav-txt">Меню</div>
      </button>

      <button class="nav-item" data-route="cart" id="navCartBtn">
        <div class="nav-ico">🛒</div>
        <div class="nav-txt">Корзина</div>
        <span class="nav-badge hidden" id="cartBadge">0</span>
      </button>

      <button class="nav-item" data-route="feedback">
        <div class="nav-ico">💬</div>
        <div class="nav-txt">Связь</div>
      </button>
    </div>
  `;

  // 2) Навигация по клику + активное состояние
  const buttons = Array.from(sidebar.querySelectorAll(".nav-item"));

  function setActive(route) {
    buttons.forEach(b => b.classList.toggle("active", b.dataset.route === route));
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;
      setActive(route);
      navigate(route, ctx);
    });
  });

  // 3) Badge: количество товаров в корзине
  const badge = sidebar.querySelector("#cartBadge");

  function calcItemsCount(cartState) {
    // Поддержим обе структуры:
    // a) cart.items = { [id]: qty }
    // b) cart = { [id]: qty }
    const items = cartState?.items ?? cartState ?? {};
    let count = 0;
    for (const k in items) count += Number(items[k] || 0);
    return count;
  }

  function updateBadge() {
    const cartState = ctx.store.getState().cart;
    const count = calcItemsCount(cartState);

    if (count > 0) {
      badge.textContent = String(count);
      badge.classList.remove("hidden");
    } else {
      badge.textContent = "0";
      badge.classList.add("hidden");
    }
  }

  updateBadge();

  // подписка на store, чтобы badge обновлялся всегда
  const unsub = ctx.store.subscribe(() => {
    updateBadge();
  });

  // выставляем активную при старте
  setActive(ctx.route || "menu");

  // cleanup — важно, чтобы не копились подписки при перемонтировании
  return () => unsub?.();
}