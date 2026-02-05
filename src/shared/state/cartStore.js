// src/shared/state/cartStore.js
// Store хранит состояние корзины и даёт actions для изменения.
// ВАЖНО: store НЕ знает о ценах и товарах — только количества по id.
// Так архитектура чище: данные меню отдельно, состояние корзины отдельно.

export function cartStore() {
  // items: { [productId]: count }
  let items = {};

  return {
    selectors: {
      items: () => items,

      // Кол-во позиций (не уникальных товаров, а суммарно всех)
      countAll: () => Object.values(items).reduce((a, b) => a + b, 0),

      // Кол-во уникальных товаров
      countUnique: () => Object.keys(items).length,

      getCount: (id) => items[id] || 0,
    },

    actions: {
      add: (id) => {
        items[id] = (items[id] || 0) + 1;
      },

      remove: (id) => {
        if (!items[id]) return;
        items[id] -= 1;
        if (items[id] <= 0) delete items[id];
      },

      clear: () => {
        items = {};
      },
    },
  };
}
