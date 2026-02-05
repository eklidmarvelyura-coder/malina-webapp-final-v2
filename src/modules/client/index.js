import { registerRoute, navigate } from "../../shared/router.js";
import { renderClientNav } from "./pages/nav.js";

import { renderMenuPage } from "./pages/menu.js";
import { renderCartPage } from "./pages/cart.js";
import { renderFeedbackPage } from "./pages/feedback.js";

export function mountClientApp(store, tg) {
  const ctx = { store, tg };

  // sidebar
  renderClientNav(document.getElementById("sidebar"), ctx);

  // routes
  registerRoute("menu", renderMenuPage);
  registerRoute("cart", renderCartPage);
  registerRoute("feedback", renderFeedbackPage);

  // старт
  navigate("menu", ctx);
}
