// src/shared/router.js
// Router + lifecycle
// Идея: при переходе между страницами мы вызываем cleanup предыдущей страницы,
// чтобы не копились подписки store.subscribe и обработчики событий.

let currentCleanup = null;

/**
 * Регистрируем cleanup текущей страницы.
 * cleanup — функция, которая отписывает подписки и снимает обработчики.
 */
export function setCleanup(fn) {
  currentCleanup = typeof fn === "function" ? fn : null;
}

/**
 * Переход на страницу.
 * 1) выполняем cleanup прошлой страницы
 * 2) ставим ctx.route
 * 3) уведомляем UI (sidebar и др.)
 * 4) вызываем ctx.render(route)
 */
export function navigate(route, ctx) {
  // --- (1) cleanup предыдущей страницы ---
  if (typeof currentCleanup === "function") {
    try { currentCleanup(); } catch (_) {}
  }
  currentCleanup = null;

  // --- (2) route state ---
  if (ctx) ctx.route = route;

  // --- (3) уведомляем UI о смене маршрута ---
  // 3.1) через ctx (быстро и локально)
  if (typeof ctx?.onRouteChange === "function") {
    try { ctx.onRouteChange(route); } catch (_) {}
  }

  // 3.2) через глобальное событие (супер-надёжно, если где-то ctx потерялся)
  window.dispatchEvent(new CustomEvent("route:changed", { detail: { route } }));

  // --- (4) render страницы ---
  ctx?.render?.(route);

  // --- page-enter анимация на контейнере контента ---
  // Делаем после render, чтобы класс применялся к уже вставленному DOM
  if (ctx?.content) {
    ctx.content.classList.remove("page-enter");
    // reflow, чтобы анимация всегда запускалась
    void ctx.content.offsetWidth;
    ctx.content.classList.add("page-enter");
  }
}
