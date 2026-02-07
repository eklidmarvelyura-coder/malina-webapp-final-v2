// src/modules/client/pages/success.js
// Страница "Заказ принят" — финальная точка UX флоу

import { renderHeader } from "../../../shared/ui/header.js";
import { navigate } from "../../../shared/router.js";

export function renderSuccessPage(ctx) {
  const { content } = ctx;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="successHeader"></div>
    </div>

    <div class="success-wrap">
      <div class="success-card glass">
        <div class="success-ico">✅</div>
        <div class="success-title">Заказ принят</div>
        <div class="success-sub muted">
          Мы уже готовим его. Если выбрана доставка — курьер свяжется с вами.
        </div>

        <button class="primary" id="backToMenuBtn">Вернуться в меню</button>
      </div>
    </div>
  `;

  renderHeader(content.querySelector("#successHeader"), { subtitle: "Готово" });

  content.querySelector("#backToMenuBtn").onclick = () => {
    navigate("menu", ctx);
  };

  return () => {};
}
