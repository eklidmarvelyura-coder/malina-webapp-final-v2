// src/modules/client/pages/about.js
import { renderHeader } from "../../../shared/ui/header.js";

export function renderAboutPage(ctx) {
  const { content } = ctx;

  content.innerHTML = `
    <div class="glass" id="aboutHeader"></div>

    <div class="glass-lite" style="padding:16px; margin-top:14px;">
      <h2 style="margin:0 0 8px;">О кафе</h2>
      <p class="muted" style="margin:0;">
        Malina Cafe — кофе и выпечка с доставкой. Дальше здесь будет адрес, график работы,
        условия доставки и кнопка открытия карты.
      </p>

      <div class="glass-lite" style="padding:14px; margin-top:14px;">
        <div class="muted" style="font-size:13px;">Адрес (пример)</div>
        <div style="font-weight:900; margin-top:6px;">Bangkok, Sukhumvit (placeholder)</div>
      </div>
    </div>
  `;

  renderHeader(document.getElementById("aboutHeader"), { subtitle: "О нас" });

  // cleanup не нужен — подписок нет
  return () => {};
}
