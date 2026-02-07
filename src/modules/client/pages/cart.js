// src/modules/client/pages/cart.js
// Корзина "до идеала":
// - элементы как карточки меню (стекло + фото + контролы)
// - empty-state с кнопкой "Перейти в меню"
// - sticky footer: Итого + кнопка оформить (disabled если пусто)
// - корректные итоги (sum) считаем из PRODUCT_BY_ID

import { renderHeader } from "../../../shared/ui/header.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { navigate } from "../../../shared/router.js";

function calcTotal(cartItems) {
  let total = 0;
  for (const id in cartItems) {
    const p = PRODUCT_BY_ID[id];
    if (!p) continue;
    total += Number(p.price || 0) * Number(cartItems[id] || 0);
  }
  return total;
}

function cartToList(cartItems) {
  // превращаем {id: qty} -> [{id, qty, product}]
  const list = [];
  for (const id in cartItems) {
    const qty = Number(cartItems[id] || 0);
    const product = PRODUCT_BY_ID[id];
    if (!product || qty <= 0) continue;
    list.push({ id, qty, product });
  }
  // можно сортировать по названию (приятнее)
  list.sort((a, b) => (a.product.name || "").localeCompare(b.product.name || "", "ru"));
  return list;
}

function CartItemCard({ product, qty, onPlus, onMinus }) {
  const sum = (Number(product.price || 0) * Number(qty || 0));

  return `
    <div class="product-card cart-card">
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

      <div class="controls">
        <button class="ctrl-btn" data-act="minus" data-id="${product.id}">−</button>
        <span class="ctrl-count">${qty}</span>
        <button class="ctrl-btn" data-act="plus" data-id="${product.id}">+</button>
      </div>
    </div>
  `;
}

export function renderCartPage(container, ctx) {
  // container — то место, куда рендерится страница справа от sidebar
  container.innerHTML = `
    <div class="menu-sticky glass">
      <div id="cartHeader"></div>
    </div>

    <div id="cartBody"></div>

    <div class="cart-footer">
      <div class="cart-total-row">
        <div class="muted">Итого</div>
        <div class="cart-total-val" id="cartTotalVal">0 ฿</div>
      </div>
      <button class="primary" id="checkoutBtn" disabled>Оформить заказ</button>
    </div>
  `;

  // header
  renderHeader(container.querySelector("#cartHeader"), { subtitle: "Корзина" });

  const bodyEl = container.querySelector("#cartBody");
  const totalEl = container.querySelector("#cartTotalVal");
  const checkoutBtn = container.querySelector("#checkoutBtn");

  function render() {
    const cartItems = ctx.store.cart.selectors.items(); // {id: qty} :contentReference[oaicite:1]{index=1}
    const list = cartToList(cartItems);
    const total = calcTotal(cartItems);

    totalEl.textContent = `${total} ฿`;

    // кнопка заказа активна только если есть товары
    checkoutBtn.disabled = list.length === 0;

    if (list.length === 0) {
      bodyEl.innerHTML = `
        <div class="empty glass">
          <div class="empty-ico">🧺</div>
          <div class="empty-title">Корзина пустая</div>
          <div class="empty-sub">Добавьте товары в меню</div>
          <button class="primary empty-btn" id="goMenuBtn">Перейти в меню</button>
        </div>
      `;

      bodyEl.querySelector("#goMenuBtn").onclick = () => {
        navigate("menu", ctx);
      };
      return;
    }

    bodyEl.innerHTML = `
      <div class="grid cart-grid">
        ${list
          .map(({ product, qty }) =>
            CartItemCard({
              product,
              qty,
            })
          )
          .join("")}
      </div>
    `;
  }

  // делегирование кликов +/− (чтобы не навешивать кучу обработчиков)
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);

    if (act === "plus") ctx.store.cart.actions.add(id);
    if (act === "minus") ctx.store.cart.actions.remove(id);
    // store.notify вызывается автоматически обёрткой в createStore() :contentReference[oaicite:2]{index=2}
  });

  checkoutBtn.onclick = () => {
    // Пока без сервера: просто подтверждение.
    // Следующий шаг — собрать данные доставки и отправить в Telegram bot/server.
    alert("Скоро: оформление заказа (адрес, телефон) + отправка в канал 🙂");
  };

  render();

  const unsub = ctx.store.subscribe(() => render());

  // cleanup для роутера
  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
