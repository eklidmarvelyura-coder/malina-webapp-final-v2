// src/app.js
import { renderShell } from "./shared/ui/layout.js";

import { createStore } from "./shared/state/store.js";
import { userStore } from "./shared/state/userStore.js";
import { cartStore } from "./shared/state/cartStore.js";

import { mountClientApp } from "./modules/client/index.js";
import { ordersStore } from "./shared/state/ordersStore.js";


const tg = window.Telegram?.WebApp;
if (tg) tg.ready();

// 1) Рисуем каркас (sidebar + content)
const root = document.getElementById("app");
renderShell(root);

// 2) Создаём store
const store = createStore({
  cart: cartStore(),
  user: userStore(),
  orders: ordersStore(), // подключаем стор для заказов, чтобы он был доступен в любом месте приложения
});


// 3) Монтируем клиентское приложение (pages + sidebar)
mountClientApp(store, tg);
