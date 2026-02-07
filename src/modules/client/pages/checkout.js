// src/modules/client/pages/checkout.js
// Checkout (без форм имени/телефона):
// - user берём из Telegram initDataUnsafe (если открыто в TG)
// - геолокация по разрешению браузера
// - красивый список заказа карточками
// - отправка payload в tg.sendData()
// - после отправки: clear корзины + navigate("success")

import { renderHeader } from "../../../shared/ui/header.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { navigate } from "../../../shared/router.js";

function buildOrder(cartItems) {
  const items = [];
  let total = 0;

  for (const id in cartItems) {
    const qty = Number(cartItems[id] || 0);
    if (qty <= 0) continue;

    const p = PRODUCT_BY_ID[id];
    if (!p) continue;

    const sum = Number(p.price || 0) * qty;
    total += sum;

    items.push({
      id: Number(id),
      name: p.name,
      price: Number(p.price || 0),
      qty,
      sum,
      image: p.image,
    });
  }

  items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  return { items, total };
}

function getTgUser(tg) {
  try {
    const u = tg?.initDataUnsafe?.user;
    if (!u) return null;
    return {
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      username: u.username,
      language_code: u.language_code,
    };
  } catch (_) {
    return null;
  }
}

export function renderCheckoutPage(ctx) {
  const { content, store, tg } = ctx;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="checkoutHeader"></div>
    </div>
    <div class="checkout-wrap" id="checkoutWrap"></div>
  `;

  renderHeader(content.querySelector("#checkoutHeader"), { subtitle: "Оформление" });

  const wrap = content.querySelector("#checkoutWrap");

  // локальное состояние страницы
  const pageState = {
    mode: "delivery", // delivery | pickup
    geo: null,        // {lat, lon, accuracy} | null
  };

  function render() {
    const cartItems = store.cart.selectors.items();
    const order = buildOrder(cartItems);

    // если корзина пустая — нечего оформлять
    if (order.items.length === 0) {
      wrap.innerHTML = `
        <div class="empty glass">
          <div class="empty-ico">🧺</div>
          <div class="empty-title">Нечего оформлять</div>
          <div class="empty-sub">Добавь товары в корзину</div>
          <button class="primary empty-btn" id="goMenuBtn">Перейти в меню</button>
        </div>
      `;
      wrap.querySelector("#goMenuBtn").onclick = () => navigate("menu", ctx);
      return;
    }

    wrap.innerHTML = `
      <div class="checkout-grid">
        <div class="checkout-panel glass-lite">
          <div class="segmented">
            <button class="seg-btn ${pageState.mode === "delivery" ? "active" : ""}" data-mode="delivery">Доставка</button>
            <button class="seg-btn ${pageState.mode === "pickup" ? "active" : ""}" data-mode="pickup">Самовывоз</button>
          </div>

          <div class="checkout-note">
            <div class="note-title">Данные клиента</div>
            <div class="muted">
              Профиль берём из Telegram. Телефон Telegram автоматически не отдаёт —
              позже добавим запрос контакта через бота.
            </div>
          </div>

          <div class="geo-box">
            <div class="geo-title">Локация</div>
            <div class="muted geo-sub">
              ${pageState.geo
                ? `Определено: ${pageState.geo.lat.toFixed(5)}, ${pageState.geo.lon.toFixed(5)} (±${Math.round(pageState.geo.accuracy)}м)`
                : `Не определена. Нажми кнопку ниже — браузер спросит разрешение.`}
            </div>
            <button class="primary" id="geoBtn">
              ${pageState.geo ? "Обновить геолокацию" : "Определить геолокацию"}
            </button>
          </div>
        </div>

        <div class="checkout-summary glass-lite">
          <div class="sum-title">Ваш заказ</div>

          <div class="sum-cards">
            ${order.items.map(it => `
              <div class="sum-card">
                <img class="sum-img" src="${it.image}" alt="${it.name}">
                <div class="sum-info">
                  <div class="sum-name">${it.name}</div>
                  <div class="sum-meta">
                    <span class="muted">${it.price} ฿</span>
                    <span class="dot">•</span>
                    <span class="muted">× ${it.qty}</span>
                  </div>
                </div>
                <div class="sum-right">
                  <div class="sum-line">${it.sum} ฿</div>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="sum-total">
            <div class="muted">Итого</div>
            <div class="sum-total-val">${order.total} ฿</div>
          </div>

          <button class="primary" id="sendOrderBtn">Отправить заказ</button>

          <div class="muted" style="font-size:12px; margin-top:10px;">
            Следующий шаг: бот примет заказ и отправит в канал “Заказы”.
          </div>
        </div>
      </div>
    `;

    // переключение delivery/pickup
    wrap.querySelectorAll(".seg-btn").forEach(btn => {
      btn.onclick = () => {
        pageState.mode = btn.dataset.mode;
        render();
      };
    });

    // геолокация
    wrap.querySelector("#geoBtn").onclick = () => {
      if (!navigator.geolocation) {
        alert("Геолокация не поддерживается этим устройством/браузером");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          pageState.geo = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          render();
        },
        () => alert("Не удалось получить геолокацию. Проверь разрешения."),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    // ✅ отправка заказа (и ТОЛЬКО тут чистим корзину)
    wrap.querySelector("#sendOrderBtn").onclick = () => {
      const tgUser = getTgUser(tg);

      const payload = {
        type: "order",
        createdAt: Date.now(),
        mode: pageState.mode,
        user: tgUser,
        geo: pageState.geo, // может быть null
        order,              // items + total
      };

      if (tg?.sendData) tg.sendData(JSON.stringify(payload));
      else console.log("ORDER PAYLOAD:", payload);

      // ✅ очищаем корзину и уходим на success
      store.cart.actions.clear();
      navigate("success", ctx); // после отправки заказа показываем страницу успеха 
    };
  }

  render();
  const unsub = store.subscribe(() => render());

  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
