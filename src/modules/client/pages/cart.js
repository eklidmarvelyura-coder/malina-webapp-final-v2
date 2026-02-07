// src/modules/client/pages/cart.js
// Корзина "как в меню":
// - карточки в том же стиле (product-card + controls)
// - empty-state (красивый) с кнопкой "в меню"
// - sticky footer: итого + кнопка "оформить" (disabled если пусто)
// ВАЖНО: сигнатура как у остальных страниц: renderCartPage(ctx)

import { renderHeader } from "../../../shared/ui/header.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { navigate } from "../../../shared/router.js";

/** Считаем общую сумму корзины по справочнику товаров */
function calcTotal(cartItems) {
  let total = 0;
  for (const id in cartItems) {
    const p = PRODUCT_BY_ID[id];
    if (!p) continue;
    total += Number(p.price || 0) * Number(cartItems[id] || 0);
  }
  return total;
}

/** Превращаем объект {id: qty} в список для рендера */
function cartToList(cartItems) {
  const list = [];
  for (const id in cartItems) {
    const qty = Number(cartItems[id] || 0);
    const product = PRODUCT_BY_ID[id];
    if (!product || qty <= 0) continue;
    list.push({ id: Number(id), qty, product });
  }
  // Сортируем по имени, чтобы выглядело аккуратно
  list.sort((a, b) => (a.product.name || "").localeCompare(b.product.name || "", "ru"));
  return list;
}

/** HTML одной карточки в корзине */
function CartItemCard({ product, qty }) {
  const sum = Number(product.price || 0) * Number(qty || 0);

  return `
    <div class="product-card cart-card">
      <!-- Верх карточки (как в меню), но без клика на модалку -->
      <div class="card-click" style="cursor:default;">
        <img class="card-img" src="${product.image}" alt="${product.name}">
        <div class="cart-meta">
          <div class="cart-title">${product.name}</div>
          <div class="cart-sub">
            <span class="cart-unit">${product.price} ฿</span>
            <span class="cart-dot">•</span>
            <span class="cart-sum">${sum} ฿</span>
          </div>
        </div>
      </div>

      <!-- Контролы количества -->
      <div class="controls">
        <button class="ctrl-btn" data-act="minus" data-id="${product.id}">−</button>
        <span class="ctrl-count">${qty}</span>
        <button class="ctrl-btn" data-act="plus" data-id="${product.id}">+</button>
      </div>
    </div>
  `;
}

export function renderCartPage(ctx) {
  const { content, store } = ctx;

  // Рисуем каркас страницы
  content.innerHTML = `
    <!-- Sticky header блока (чтобы выглядел как в меню) -->
    <div class="menu-sticky glass">
      <div id="cartHeader"></div>
    </div>

    <!-- Тело корзины -->
    <div id="cartBody"></div>

    <!-- Sticky footer -->
    <div class="cart-footer">
      <div class="cart-total-row">
        <div class="muted">Итого</div>
        <div class="cart-total-val" id="cartTotalVal">0 ฿</div>
      </div>
      <button class="primary" id="checkoutBtn" disabled>Оформить заказ</button>
    </div>
  `;

  // Вставляем общий header (единый компонент)
  renderHeader(content.querySelector("#cartHeader"), { subtitle: "Корзина" });

  const bodyEl = content.querySelector("#cartBody");
  const totalEl = content.querySelector("#cartTotalVal");
  const checkoutBtn = content.querySelector("#checkoutBtn");

  /** Перерисовка корзины */
  function render() {
    // cartStore хранит items как объект {id: qty}
    const cartItems = store.cart.selectors.items();
    const list = cartToList(cartItems);
    const total = calcTotal(cartItems);

    totalEl.textContent = `${total} ฿`;
    checkoutBtn.disabled = list.length === 0;

    // Empty state
    if (list.length === 0) {
      bodyEl.innerHTML = `
        <div class="empty glass">
          <div class="empty-ico">🧺</div>
          <div class="empty-title">Корзина пустая</div>
          <div class="empty-sub">Добавьте товары в меню</div>
          <button class="primary empty-btn" id="goMenuBtn">Перейти в меню</button>
        </div>
      `;
      bodyEl.querySelector("#goMenuBtn").onclick = () => navigate("menu", ctx);
      return;
    }

    // Список карточек
    bodyEl.innerHTML = `
      <div class="grid cart-grid">
        ${list.map(({ product, qty }) => CartItemCard({ product, qty })).join("")}
      </div>
    `;
  }

  // Делегирование кликов по +/−
  // Ставим на content, чтобы работало даже после перерисовки bodyEl
  function onClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);

    if (act === "plus") store.cart.actions.add(id);
    if (act === "minus") store.cart.actions.remove(id);
  }

  content.addEventListener("click", onClick);

  checkoutBtn.onclick = () => {
    // пока без сервера — следующим шагом сделаем checkout page
    alert("Следующий шаг: форма оформления заказа 🙂");
  };

  // Первый рендер
  render();

  // Подписываемся на изменения стора
  const unsub = store.subscribe(() => render());

  // cleanup — чтобы не копились подписки/обработчики при навигации
  return () => {
    try { unsub?.(); } catch (_) {}
    try { content.removeEventListener("click", onClick); } catch (_) {}
  };
}
