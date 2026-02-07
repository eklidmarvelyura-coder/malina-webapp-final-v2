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
  // cleanup...
  if (typeof currentCleanup === "function") {
    try { currentCleanup(); } catch (_) {}
  }
  currentCleanup = null;

  ctx.route = route;

  // ✅ ВАЖНО: сообщаем UI (sidebar), что маршрут сменился
  if (typeof ctx.onRouteChange === "function") {
    try { ctx.onRouteChange(route); } catch (_) {}
  }

  ctx.render(route);
}
