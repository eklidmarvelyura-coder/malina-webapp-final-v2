// src/app.js
import { initTelegram } from "./shared/telegram.js";
import { renderShell } from "./shared/ui/layout.js";
import { createStore } from "./shared/state/store.js";
import { userStore } from "./shared/state/userStore.js";
import { cartStore } from "./shared/state/cartStore.js";

import { mountClientApp } from "./modules/client/index.js";

const root = document.getElementById("app");
renderShell(root);

const tg = initTelegram();

const store = createStore({
  user: userStore(),
  cart: cartStore(),
});

// пока без сервера — роль вручную
store.user.actions.setRole("client");

mountClientApp(store, tg);

window.__store = store;
window.__tg = tg;
