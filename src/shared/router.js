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
 * 2) вызываем ctx.render(route)
 */
export function navigate(route, ctx) {
  if (typeof currentCleanup === "function") {
    try { currentCleanup(); } catch (e) { console.warn("cleanup error:", e); }
  }
  currentCleanup = null;

  ctx.route = route;
  ctx.render(route);
}
