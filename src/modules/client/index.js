// src/modules/client/index.js
import { renderClientNav } from "./pages/nav.js";

import { renderMenuPage } from "./pages/menu.js";
import { renderCartPage } from "./pages/cart.js";
import { renderFeedbackPage } from "./pages/feedback.js";
import { renderAboutPage } from "./pages/about.js";

import { navigate, setCleanup } from "../../shared/router.js";

export function mountClientApp(store, tg) {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");

  if (!sidebar || !content) {
    console.error("Layout not mounted. sidebar/content missing.", { sidebar, content });
    throw new Error("Layout not mounted: #sidebar or #content not found");
  }

  const ctx = {
    store,
    tg,
    content,
    route: "menu",

    render: (route) => {
      let cleanup = null;

      if (route === "menu") cleanup = renderMenuPage(ctx);
      else if (route === "cart") cleanup = renderCartPage(ctx);
      else if (route === "feedback") cleanup = renderFeedbackPage(ctx);
      else if (route === "about") cleanup = renderAboutPage(ctx);
      else cleanup = renderMenuPage(ctx);

      setCleanup(cleanup);
    },
  };

  // Sidebar один раз
  renderClientNav(sidebar, ctx);

  // Старт
  navigate("menu", ctx);
}
