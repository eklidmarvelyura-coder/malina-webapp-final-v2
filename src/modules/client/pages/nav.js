// src/modules/client/pages/nav.js
import { navigate } from "../../../shared/router.js";

/**
 * Sidebar navigation.
 * - Содержит 3 кнопки: Menu / Cart / Feedback
 * - Badge на "Корзина" появляется только если товаров > 0
 * - Подсветка активной страницы
 */
export function renderClientNav(sidebar, ctx) {
  const { store } = ctx;

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

  const buttons = Array.from(sidebar.querySelectorAll(".nav-item"));
  const badge = sidebar.querySelector("#cartBadge");

  function setActive(route) {
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.route === route));
  }

  // Универсально считаем кол-во товаров.
  // Поддержим две структуры:
  // - state.cart.items = { [id]: qty }
  // - state.cart = { [id]: qty }
  function calcCountFromState(cartState) {
    const items = cartState?.items ?? cartState ?? {};
    let count = 0;
    for (const k in items) count += Number(items[k] || 0);
    return count;
  }

  function updateBadge() {
    const cartState = store.getState().cart;
    const count = calcCountFromState(cartState);

    // Если 0 — badge скрываем полностью (чтобы кнопка была “красивая”)
    if (count <= 0) {
      badge.classList.add("hidden");
      badge.textContent = "0";
      return;
    }

    badge.textContent = String(count);
    badge.classList.remove("hidden");
  }

  // Навигация по клику
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;
      setActive(route);
      navigate(route, ctx);
    });
  });

  // Стартовое состояние
  setActive(ctx.route || "menu");
  updateBadge();

  // Подписка на store — badge обновляется при любом изменении корзины
  const unsub = store.subscribe(() => {
    updateBadge();
  });

  // cleanup (на будущее, если sidebar будут перемонтировать)
  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
