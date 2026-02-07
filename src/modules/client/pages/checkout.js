// src/modules/client/pages/checkout.js
// Страница оформления заказа (UI + валидация + подготовка payload)
//
// Сейчас: отправляем payload через Telegram.WebApp.sendData()
// Далее: будем принимать его ботом/сервером и слать в канал.

import { renderHeader } from "../../../shared/ui/header.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { navigate } from "../../../shared/router.js";

function buildOrderFromCart(cartItems) {
  const items = [];
  let total = 0;

  for (const id in cartItems) {
    const qty = Number(cartItems[id] || 0);
    if (qty <= 0) continue;

    const p = PRODUCT_BY_ID[id];
    if (!p) continue;

    const lineSum = Number(p.price || 0) * qty;
    total += lineSum;

    items.push({
      id: Number(id),
      name: p.name,
      price: Number(p.price || 0),
      qty,
      sum: lineSum,
    });
  }

  return { items, total };
}

function onlyDigits(str) {
  return (str || "").replace(/\D/g, "");
}

function validate(form, order) {
  const errors = {};

  if (order.items.length === 0) errors.cart = "Корзина пустая";

  const name = (form.name || "").trim();
  if (name.length < 2) errors.name = "Введите имя";

  const phoneDigits = onlyDigits(form.phone);
  // Очень мягкая проверка: 9–15 цифр
  if (phoneDigits.length < 9 || phoneDigits.length > 15) errors.phone = "Введите телефон";

  if (form.mode === "delivery") {
    const address = (form.address || "").trim();
    if (address.length < 6) errors.address = "Введите адрес доставки";
  }

  return errors;
}

export function renderCheckoutPage(ctx) {
  const { content, store, tg } = ctx;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="checkoutHeader"></div>
    </div>

    <div class="checkout-wrap" id="checkoutWrap"></div>
  `;

  renderHeader(content.querySelector("#checkoutHeader"), { subtitle: "Оформление заказа" });

  const wrap = content.querySelector("#checkoutWrap");

  // Локальное состояние формы (без глобального стора — проще)
  const form = {
    mode: "delivery",  // delivery | pickup
    name: "",
    phone: "",
    address: "",
    comment: "",
  };

  function render() {
    const cartItems = store.cart.selectors.items();
    const order = buildOrderFromCart(cartItems);
    const errors = validate(form, order);

    // Если корзина пустая — показываем красивую заглушку + кнопку назад
    if (order.items.length === 0) {
      wrap.innerHTML = `
        <div class="empty glass">
          <div class="empty-ico">🧺</div>
          <div class="empty-title">Нечего оформлять</div>
          <div class="empty-sub">Добавьте товары в корзину</div>
          <button class="primary empty-btn" id="goMenuBtn">Перейти в меню</button>
        </div>
      `;
      wrap.querySelector("#goMenuBtn").onclick = () => navigate("menu", ctx);
      return;
    }

    wrap.innerHTML = `
      <div class="checkout-grid">
        <!-- Левая колонка: форма -->
        <div class="checkout-form glass-lite">
          <div class="segmented">
            <button class="seg-btn ${form.mode === "delivery" ? "active" : ""}" data-mode="delivery">Доставка</button>
            <button class="seg-btn ${form.mode === "pickup" ? "active" : ""}" data-mode="pickup">Самовывоз</button>
          </div>

          <label class="field">
            <div class="field-label">Имя</div>
            <input class="text-input" id="fName" placeholder="Как к вам обращаться" value="${escapeHtml(form.name)}">
            ${errors.name ? `<div class="field-err">${errors.name}</div>` : ""}
          </label>

          <label class="field">
            <div class="field-label">Телефон</div>
            <input class="text-input" id="fPhone" placeholder="+66..." value="${escapeHtml(form.phone)}">
            ${errors.phone ? `<div class="field-err">${errors.phone}</div>` : ""}
          </label>

          <label class="field ${form.mode === "pickup" ? "hidden" : ""}">
            <div class="field-label">Адрес доставки</div>
            <textarea class="text-area" id="fAddress" placeholder="Улица, дом, этаж, ориентир">${escapeHtml(form.address)}</textarea>
            ${errors.address ? `<div class="field-err">${errors.address}</div>` : ""}
          </label>

          <label class="field">
            <div class="field-label">Комментарий</div>
            <textarea class="text-area" id="fComment" placeholder="Например: без сахара, позвонить у подъезда...">${escapeHtml(form.comment)}</textarea>
          </label>
        </div>

        <!-- Правая колонка: краткое резюме -->
        <div class="checkout-summary glass-lite">
          <div class="sum-title">Ваш заказ</div>

          <div class="sum-list">
            ${order.items
              .map(
                (it) => `
                <div class="sum-row">
                  <div class="sum-name">${it.name} <span class="muted">× ${it.qty}</span></div>
                  <div class="sum-val">${it.sum} ฿</div>
                </div>
              `
              )
              .join("")}
          </div>

          <div class="sum-total">
            <div class="muted">Итого</div>
            <div class="sum-total-val">${order.total} ฿</div>
          </div>

          <button class="primary" id="sendOrderBtn" ${Object.keys(errors).length ? "disabled" : ""}>
            Отправить заказ
          </button>

          ${errors.cart ? `<div class="field-err" style="margin-top:10px;">${errors.cart}</div>` : ""}
          ${
            Object.keys(errors).length
              ? `<div class="muted" style="font-size:12px; margin-top:10px;">
                   Заполните обязательные поля, чтобы отправить заказ.
                 </div>`
              : `<div class="muted" style="font-size:12px; margin-top:10px;">
                   После отправки заказ улетит в Telegram (дальше подключим бот/сервер).
                 </div>`
          }
        </div>
      </div>
    `;

    // --- Обработчики ---
    // Segmented
    wrap.querySelectorAll(".seg-btn").forEach((b) => {
      b.onclick = () => {
        form.mode = b.dataset.mode;
        render();
      };
    });

    // Inputs
    const fName = wrap.querySelector("#fName");
    const fPhone = wrap.querySelector("#fPhone");
    const fAddress = wrap.querySelector("#fAddress");
    const fComment = wrap.querySelector("#fComment");

    fName.oninput = () => { form.name = fName.value; };
    fPhone.oninput = () => { form.phone = fPhone.value; };
    if (fAddress) fAddress.oninput = () => { form.address = fAddress.value; };
    fComment.oninput = () => { form.comment = fComment.value; };

    // Send order
    const sendBtn = wrap.querySelector("#sendOrderBtn");
    sendBtn.onclick = () => {
      const cartNow = store.cart.selectors.items();
      const orderNow = buildOrderFromCart(cartNow);
      const errNow = validate(form, orderNow);

      if (Object.keys(errNow).length) {
        // Ререндер, чтобы показать ошибки
        render();
        return;
      }

      const payload = {
        type: "order",
        createdAt: Date.now(),
        mode: form.mode, // delivery/pickup
        customer: {
          name: form.name.trim(),
          phone: onlyDigits(form.phone),
          address: form.mode === "delivery" ? form.address.trim() : "",
          comment: form.comment.trim(),
        },
        order: orderNow,
      };

      // Telegram WebApp (если запущено не в TG — просто покажем alert)
      if (tg && typeof tg.sendData === "function") {
        tg.sendData(JSON.stringify(payload));
        alert("Заказ отправлен ✅");
      } else {
        console.log("ORDER PAYLOAD:", payload);
        alert("Открыто не в Telegram — payload в консоли ✅");
      }

      // Дальше можно:
      // - чистить корзину (когда добавим действие clear())
      // - перекидывать на страницу "Спасибо"
      navigate("menu", ctx);
    };
  }

  // безопасный escape для инпутов/textarea
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  render();

  // Если корзина поменялась в другом месте — обновляем summary
  const unsub = store.subscribe(() => render());

  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
