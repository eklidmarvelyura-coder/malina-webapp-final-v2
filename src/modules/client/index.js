// src/modules/client/index.js
// Главный вход клиентского приложения (Telegram WebApp)
// Здесь:
// - создаётся ctx (контекст приложения)
// - подключается sidebar
// - подключаются страницы
// - работает router + cleanup

import { renderClientNav } from "./pages/nav.js";

import { renderMenuPage } from "./pages/menu.js";
import { renderCartPage } from "./pages/cart.js";
import { renderFeedbackPage } from "./pages/feedback.js";
import { renderCheckoutPage } from "./pages/checkout.js";
import { renderAboutPage } from "./pages/about.js";

import { navigate, setCleanup } from "../../shared/router.js";

export function mountClientApp(store, tg) {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");

  if (!sidebar || !content) {
    console.error("Layout not mounted. sidebar/content missing.", { sidebar, content });
    throw new Error("Layout not mounted: #sidebar or #content not found");
  }

  // 🔵 ГЛАВНЫЙ КОНТЕКСТ ПРИЛОЖЕНИЯ
  const ctx = {
    store,
    tg,
    content,
    route: "menu",

    // 🔵 РЕНДЕР СТРАНИЦ
    render: (route) => {
      let cleanup = null;

      try {
        if (route === "menu") cleanup = renderMenuPage(ctx);
        else if (route === "cart") cleanup = renderCartPage(ctx);
        else if (route === "feedback") cleanup = renderFeedbackPage(ctx);
        else if (route === "checkout") cleanup = renderCheckoutPage(ctx);
        else if (route === "about") cleanup = renderAboutPage(ctx);
        else cleanup = renderMenuPage(ctx);
      } catch (err) {
        console.error("Page render failed:", route, err);
        cleanup = renderMenuPage(ctx);
      }

      // сохраняем cleanup текущей страницы
      setCleanup(cleanup);
    },
  };

  // 🔵 SIDEBAR
  renderClientNav(sidebar, ctx);

  // 🔵 ВАЖНО: синхронизация активной кнопки sidebar
  // router будет вызывать это при каждом navigate()
  ctx.onRouteChange = (route) => {
    ctx.route = route;
    // sidebar сам подпишется и обновит active
  };

  // 🔵 СТАРТ
  navigate("menu", ctx);
}
