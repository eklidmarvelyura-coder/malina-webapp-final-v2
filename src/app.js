console.log("APP STARTED");

import { initTelegram } from "./shared/telegram.js";
import { renderShell } from "./shared/ui/layout.js";
import { createStore } from "./shared/state/store.js";
import { userStore } from "./shared/state/userStore.js";

import { mountClientApp } from "./modules/client/index.js";

const root = document.getElementById("app");
renderShell(root);

const tg = initTelegram();

const store = createStore({
  user: userStore(),
});

// Пока без сервера: вручную ставим роль.
// Завтра тут будет проверка initData на сервере.
store.user.actions.setRole("client");

// Монтируем клиентский модуль
mountClientApp(store, tg);

// Для отладки
window.__store = store;
window.__tg = tg;
