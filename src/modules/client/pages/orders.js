// src/modules/client/pages/orders.js
import { renderHeader } from "../../../shared/ui/header.js";
import { navigate } from "../../../shared/router.js";

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function renderOrdersPage(ctx) {
  const { content, store } = ctx;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="ordersHeader"></div>
    </div>

    <div class="orders-wrap" id="ordersWrap"></div>
  `;

  renderHeader(content.querySelector("#ordersHeader"), { subtitle: "История заказов" });

  const wrap = content.querySelector("#ordersWrap");

  function render() {
    const orders = store.orders.selectors.all();

    if (!orders.length) {
      wrap.innerHTML = `
        <div class="empty glass">
          <div class="empty-ico">🧾</div>
          <div class="empty-title">Пока заказов нет</div>
          <div class="empty-sub">Оформи первый заказ — и он появится здесь</div>
          <button class="primary empty-btn" id="goMenuBtn">Перейти в меню</button>
        </div>
      `;
      wrap.querySelector("#goMenuBtn").onclick = () => navigate("menu", ctx);
      return;
    }

    wrap.innerHTML = `
      <div class="orders-list">
        ${orders.map(o => `
          <div class="order-card glass-lite">
            <div class="order-top">
              <div>
                <div class="order-id">Заказ ${o.id}</div>
                <div class="muted">${formatDate(o.createdAt)}</div>
              </div>
              <div class="order-total">${o.total} ฿</div>
            </div>

            <div class="order-meta muted">
              ${o.mode === "delivery" ? "Доставка" : "Самовывоз"}
              <span class="dot">•</span>
              Статус: <b>${o.status}</b>
            </div>

            <div class="order-items">
              ${o.items.slice(0, 4).map(it => `
                <div class="order-item-row">
                  <span>${it.name}</span>
                  <span class="muted">× ${it.qty}</span>
                  <span>${it.sum} ฿</span>
                </div>
              `).join("")}
              ${o.items.length > 4 ? `<div class="muted" style="margin-top:8px;">и ещё ${o.items.length - 4} позиций…</div>` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  render();
  const unsub = store.subscribe(() => render());

  return () => {
    try { unsub?.(); } catch (_) {}
  };
}
