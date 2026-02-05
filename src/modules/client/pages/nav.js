import { navigate } from "../../../shared/router.js";

export function renderClientNav(sidebar, ctx) {
  sidebar.innerHTML = `
    <button class="nav-btn" data-go="menu">🍽</button>
    <button class="nav-btn" data-go="cart">🛒</button>
    <button class="nav-btn" data-go="feedback">💬</button>

    <div class="sidebar-footer">
      <div class="glass-badge">Malina</div>
    </div>
  `;

  sidebar.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.go, ctx));
  });
}
