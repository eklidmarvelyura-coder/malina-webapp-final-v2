// src/shared/state/cartStore.js
// Хранилище корзины. Держим ТОЛЬКО количества по id.
// Цены/названия/картинки берём из PRODUCT_BY_ID при рендере.
// Важно: notify() приходит из createStore() и триггерит перерисовку UI.

export function cartStore() {
  // ВНУТРЕННЕЕ состояние модуля (никакого `state` глобально нет!)
  const items = {}; // { [id]: qty }

  let notify = () => {};

  // ---- селекторы (чтение) ----
  const selectors = {
  // Вернём КОПИЮ, чтобы никто снаружи не мутировал напрямую
  items() {
    return { ...items };
  },

  // ✅ Количество конкретного товара (для модалки/карточки)
  getCount(id) {
    const key = String(id);
    return Number(items[key] || 0);
  },

  // Сколько всего единиц товара в корзине (для badge)
  countAll() {
    let c = 0;
    for (const id in items) c += Number(items[id] || 0);
    return c;
  },
};


  // ---- actions (изменения) ----
  const actions = {
    add(id) {
      const key = String(id);
      items[key] = (Number(items[key]) || 0) + 1;
      notify();
    },

    remove(id) {
      const key = String(id);
      if (!items[key]) return;

      items[key] = Number(items[key]) - 1;
      if (items[key] <= 0) delete items[key];

      notify();
    },

    set(id, qty) {
      const key = String(id);
      const n = Number(qty || 0);

      if (n <= 0) delete items[key];
      else items[key] = n;

      notify();
    },

    // ✅ НОВОЕ: очистка корзины (без state, просто чистим items)
    clear() {
      for (const id in items) delete items[id];
      notify();
    },
  };

  // createStore() подставит сюда свою функцию уведомления
  function _setNotify(fn) {
    notify = typeof fn === "function" ? fn : () => {};
  }

  return {
    selectors,
    actions,
    _setNotify,
  };
}
