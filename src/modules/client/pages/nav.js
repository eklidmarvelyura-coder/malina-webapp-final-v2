// src/modules/client/pages/nav.js
import { navigate } from "../../../shared/router.js";

/**
 * Универсальный sidebar:
 * - "Мы на карте"
 * - Меню / Корзина (badge) / Связь
 * - Active подсветка
 * - Badge не ломает приложение, даже если store устроен нестандартно
 */
export function renderClientNav(sidebar, ctx) {
  const store = ctx.store; // может быть любым

  sidebar.innerHTML = `
    <div class="nav-top">
    <div class="brand">🍓</div> 
    
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

  // ---- Универсально получаем state из стора ----
  function getStateSafe() {
    try {
      if (!store) return null;
      if (typeof store.getState === "function") return store.getState();
      if (typeof store.get === "function") return store.get();
      if (store.state) return store.state;
      return null;
    } catch (e) {
      console.warn("getStateSafe error:", e);
      return null;
    }
  }

  // ---- Считаем товары в корзине ----
  function calcCountFromState(state) {
    // поддержка вариантов:
    // state.cart.items
    // state.cart
    // state.cartStore/items
    const cartState =
      state?.cart ??
      state?.cartStore ??
      state?.stores?.cart ??
      null;

    const items = cartState?.items ?? cartState ?? {};
    let count = 0;
    for (const k in items) count += Number(items[k] || 0);
    return count;
  }

  function updateBadge() {
    const state = getStateSafe();
    const count = state ? calcCountFromState(state) : 0;

    if (count <= 0) {
      badge.classList.add("hidden");
      badge.textContent = "0";
      return;
    }

    badge.textContent = String(count);
    badge.classList.remove("hidden");
  }

  // ---- Клик по кнопкам ----
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;

      // MAP — пока без отдельной страницы:
      // делаем popup/alert, а позже сделаем полноценный modal с картой.
      if (route === "map") {
        // Telegram WebApp: showPopup может быть не поддержан в старых версиях.
        // Поэтому используем простой alert.
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

  // ---- Подписка на store (если есть) ----
  let unsub = null;
  if (store && typeof store.subscribe === "function") {
    unsub = store.subscribe(() => updateBadge());
  }

  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
