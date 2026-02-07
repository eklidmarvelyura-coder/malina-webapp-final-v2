// src/modules/client/pages/checkout.js
// Checkout (без форм имени/телефона):
// - user берём из Telegram initDataUnsafe (если открыто в TG)
// - геолокация по разрешению браузера
// - доставка требует гео: кнопка отправки активна только при geo
// - самовывоз запрещён, если в заказе есть category === "coffee"
// - отправка payload в tg.sendData()
// - после отправки: clear корзины + success page

import { renderHeader } from "../../../shared/ui/header.js";
import { PRODUCT_BY_ID } from "../../../shared/data/products.js";
import { navigate } from "../../../shared/router.js";
import { toast } from "../../../shared/components/toast.js";

function buildOrder(cartItems) {
  const items = [];
  let total = 0;

  for (const id in cartItems) {
    const qty = Number(cartItems[id] || 0);
    if (qty <= 0) continue;

    const p = PRODUCT_BY_ID[String(id)];
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
      category: p.category,
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

  // Локальное состояние страницы checkout
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

    // ✅ Ограничение: самовывоз нельзя, если в заказе есть кофе
    const hasCoffee = order.items.some((it) => it.category === "coffee");

    // если вдруг пользователь стоял на самовывозе и добавил кофе — возвращаем на доставку
    if (hasCoffee && pageState.mode === "pickup") {
      pageState.mode = "delivery";
    }

    // ✅ Правило UX: доставка требует геолокацию
    const canSend = pageState.mode === "pickup" || !!pageState.geo;

    wrap.innerHTML = `
      <div class="checkout-grid">
        <div class="checkout-panel glass-lite">
          <div class="segmented">
            <button class="seg-btn ${pageState.mode === "delivery" ? "active" : ""}" data-mode="delivery">
              Доставка
            </button>

            <button
              class="seg-btn ${pageState.mode === "pickup" ? "active" : ""} ${hasCoffee ? "disabled" : ""}"
              data-mode="pickup"
              ${hasCoffee ? "disabled" : ""}
              title="${hasCoffee ? "Самовывоз недоступен при наличии кофе в заказе" : ""}"
            >
              Самовывоз
            </button>
          </div>

          ${hasCoffee ? `
            <div class="field-err">
              Самовывоз недоступен, если в заказе есть кофе ☕
              (Кофе нужно пить сразу, а везти его не всегда удобно)
            </div>
          ` : ""}

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

          <button class="primary" id="sendOrderBtn" ${canSend ? "" : "disabled"}>
            Отправить заказ
          </button>

          ${!canSend ? `
            <div class="field-err" style="margin-top:10px;">
              Для доставки нужно разрешить геолокацию 📍
            </div>
          ` : ""}

          <div class="muted" style="font-size:12px; margin-top:10px;">
            Следующий шаг: бот примет заказ и отправит его в канал “Заказы”.
          </div>
        </div>
      </div>
    `;

    // переключение delivery/pickup
    wrap.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.onclick = () => {
        const mode = btn.dataset.mode;

        // ✅ блокируем самовывоз, если в корзине есть кофе
        if (mode === "pickup" && hasCoffee) return;

        pageState.mode = mode;
        render();
      };
    });

    // геолокация
    wrap.querySelector("#geoBtn").onclick = () => {
      if (!navigator.geolocation) {
        toast.error("Геолокация не поддерживается этим устройством/браузером");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          pageState.geo = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          toast.success("Геолокация получена ✅");
          render();
        },
        () => toast.error("Не удалось получить геолокацию. Проверь разрешения."),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    // отправка заказа
    wrap.querySelector("#sendOrderBtn").onclick = () => {
      // доставка требует geo
      if (!canSend) return;

      const tgUser = getTgUser(tg);

      const payload = {
        type: "order",
        createdAt: Date.now(),
        mode: pageState.mode,
        user: tgUser,
        geo: pageState.geo, // может быть null (если pickup)
        order,              // items + total
      };

      if (tg?.sendData) tg.sendData(JSON.stringify(payload));
      else console.log("ORDER PAYLOAD:", payload);

      toast.success("Заказ отправлен ✅");

      // очищаем корзину и уходим на success
      store.cart.actions.clear();
      navigate("success", ctx);
    };
  }

  render();
  const unsub = store.subscribe(() => render());

  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
