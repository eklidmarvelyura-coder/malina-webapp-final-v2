// src/shared/ui/header.js
// Единый Header-компонент для всех страниц.
// ВАЖНО: экспорт ИМЕННО named export renderHeader,
// чтобы import { renderHeader } работал в menu.js/cart.js/feedback.js.

export function renderHeader(container, { subtitle = "" } = {}) {
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <div class="header-left">
        <h1>🍓 Malina Cafe</h1>
        <p class="muted">${subtitle || "&nbsp;"}</p>
      </div>
    </div>
  `;
}
