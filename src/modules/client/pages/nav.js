// src/modules/client/pages/nav.js
import { navigate } from "../../../shared/router.js";

/**
 * Sidebar navigation (под createStore + cartStore из твоей архитектуры):
 * - badge берём из store.cart.selectors.countAll()
 * - badge скрыт, когда товаров 0
 * - active подсветка текущей страницы
 * - "Мы на карте" вернули (пока stub)
 */
export function renderClientNav(sidebar, ctx) {
  const store = ctx.store;

  sidebar.innerHTML = `
    <div class="nav-top">
      <button class="nav-item" data-route="map" id="navMapBtn">
        <div class="nav-ico">📍</div>
        <div class="nav-txt">Мы на карте</div>
      </button>

      

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

  function getCartCount() {
    // Под твою cartStore(): selectors.countAll() :contentReference[oaicite:2]{index=2}
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

  // клики
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;

      if (route === "map") {
        alert("Скоро здесь будет карта кафе 🙂");
        return;
      }

      setActive(route);
      navigate(route, ctx);
    });
  });

  // старт
  setActive(ctx.route || "menu");
  updateBadge();

  // store.subscribe существует :contentReference[oaicite:3]{index=3}
  const unsub = store?.subscribe?.(() => updateBadge());

  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
