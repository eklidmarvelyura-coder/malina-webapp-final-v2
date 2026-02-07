// src/modules/client/pages/checkout.js
// Checkout v2 (без форм имени/телефона):
// - берём пользователя из Telegram (если доступно)
// - красивый список заказа карточками
// - выбор: доставка / самовывоз
// - кнопка "Определить геолокацию" (если пользователь разрешит)
// - tg.sendData(payload) с order + user + geo

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

  // красиво: сначала по категории/имени можно позже
  items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  return { items, total };
}

function getTgUser(tg) {
  // Telegram WebApp даёт user в initDataUnsafe (если открыто из бота)
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

  // локальное состояние
  const state = {
    mode: "delivery", // delivery | pickup
    geo: null,        // {lat, lon, accuracy}
  };

  function render() {
    const cartItems = store.cart.selectors.items();
    const order = buildOrder(cartItems);

    // пусто
    if (order.items.length === 0) {
      wrap.innerHTML = `
        <div class="empty glass">
          <div class="empty-ico">🧺</div>
          <div class="empty-title">Нечего оформлять</div>
          <div class="empty-sub">Добавь товары в меню</div>
          <button class="primary empty-btn" id="goMenuBtn">Перейти в меню</button>
        </div>
      `;
      wrap.querySelector("#goMenuBtn").onclick = () => navigate("menu", ctx);
      return;
    }

    wrap.innerHTML = `
      <div class="checkout-grid">
        <!-- Левый блок: доставка/самовывоз + гео -->
        <div class="checkout-panel glass-lite">
          <div class="segmented">
            <button class="seg-btn ${state.mode === "delivery" ? "active" : ""}" data-mode="delivery">Доставка</button>
            <button class="seg-btn ${state.mode === "pickup" ? "active" : ""}" data-mode="pickup">Самовывоз</button>
          </div>

          <div class="checkout-note">
            <div class="note-title">Данные клиента</div>
            <div class="muted">
              Мы берём профиль из Telegram. Телефон Telegram не отдаёт автоматически —
              позже добавим запрос контакта через бота (один раз).
            </div>
          </div>

          <div class="geo-box">
            <div class="geo-title">Локация</div>
            <div class="muted geo-sub">
              ${state.geo
                ? `Определено: ${state.geo.lat.toFixed(5)}, ${state.geo.lon.toFixed(5)} (±${Math.round(state.geo.accuracy)}м)`
                : `Не определена. Нажми кнопку ниже — браузер спросит разрешение.`}
            </div>

            <button class="primary" id="geoBtn">
              ${state.geo ? "Обновить геолокацию" : "Определить геолокацию"}
            </button>
          </div>
        </div>

        <!-- Правый блок: красивый заказ -->
        <div class="checkout-summary glass-lite">
          <div class="sum-title">Ваш заказ</div>

          <div class="sum-cards" id="sumCards">
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

          <button class="primary" id="sendOrderBtn">
            Отправить заказ
          </button>

          <div class="muted" style="font-size:12px; margin-top:10px;">
            Следующий шаг: бот примет заказ и отправит в канал “Заказы”.
          </div>
        </div>
      </div>
    `;

    // переключатель режимов
    wrap.querySelectorAll(".seg-btn").forEach(btn => {
      btn.onclick = () => {
        state.mode = btn.dataset.mode;
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
          state.geo = {
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

    // отправка
    wrap.querySelector("#sendOrderBtn").onclick = () => {
      const tgUser = getTgUser(tg);
      const payload = {
        type: "order",
        createdAt: Date.now(),
        mode: state.mode,
        user: tgUser,
        geo: state.geo,        // может быть null
        order: order,          // items + total
      };

      if (tg?.sendData) {
        tg.sendData(JSON.stringify(payload));
        alert("Заказ отправлен ✅");
      } else {
        console.log("ORDER PAYLOAD:", payload);
        alert("Открыто не в Telegram — payload в консоли ✅");
      }

      // отправили payload...
       store.cart.actions.clear();     // ✅ очищаем корзину
       navigate("success", ctx);       // ✅ красивый экран "принято"

    };
  }

  render();
  const unsub = store.subscribe(() => render());

  return () => { try { unsub?.(); } catch (_) {} };
}
