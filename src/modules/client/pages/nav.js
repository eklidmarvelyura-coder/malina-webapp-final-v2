// src/modules/client/pages/nav.js
import { navigate } from "../../../shared/router.js";
import { openCafeMapModal } from "../../../shared/components/mapModal.js";

/**
 * Sidebar navigation:
 * - badge: store.cart.selectors.countAll()
 * - badge скрыт, когда товаров 0
 * - active подсветка текущей страницы
 * - "Мы на карте" открывает модалку
 */
export function renderClientNav(sidebar, ctx) {
  const store = ctx.store;

  sidebar.innerHTML = `
    <div class="nav-top">

      <button class="nav-item" data-route="map" id="navMapBtn">
        <div class="nav-ico">📍</div>
        <div class="nav-txt">Мы на карте</div>
      </button>

      <button class="nav-item" data-route="menu" id="navMenuBtn">
        <div class="nav-ico">🍽</div>
        <div class="nav-txt">Меню</div>
      </button>

      <button class="nav-item" data-route="cart" id="navCartBtn">
        <div class="nav-ico">🛒</div>
        <div class="nav-txt">Корзина</div>
        <span class="nav-badge hidden" id="cartBadge">0</span>
      </button>

      <button class="nav-item" data-route="feedback" id="navFeedbackBtn">
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

  function getCartCount() {
    const cart = store?.cart;
    if (!cart?.selectors?.countAll) return 0;
    return Number(cart.selectors.countAll() || 0);
  }

  function updateBadge() {
    const count = getCartCount();

    if (count <= 0) {
      badge.classList.add("hidden");
      badge.textContent = "0";
      return;
    }

    badge.textContent = String(count);
    badge.classList.remove("hidden");
  }

  // --- клики по кнопкам ---
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;

      if (route === "map") {
        openCafeMapModal();
        return;
      }

      // ВАЖНО: подсветку ставим сразу (ощущение “быстро”),
      // а router потом подтвердит через route:changed
      setActive(route);
      navigate(route, ctx);
    });
  });

  // --- 1) ctx-хук (router вызывает ctx.onRouteChange) ---
  ctx.onRouteChange = (route) => {
    setActive(route);
  };

  // --- 2) глобальный хук (на случай, если navigate вызвали без правильного ctx) ---
  const onRouteChanged = (e) => {
    const route = e.detail?.route;
    if (!route) return;
    setActive(route);
  };
  window.addEventListener("route:changed", onRouteChanged);

  // стартовая подсветка
  setActive(ctx.route || "menu");
  updateBadge();

  // подписка на изменения стора (badge)
  const unsub = store?.subscribe?.(() => updateBadge());

  // cleanup
  return () => {
    try { unsub?.(); } catch (_) {}
    try { window.removeEventListener("route:changed", onRouteChanged); } catch (_) {}
  };
}
