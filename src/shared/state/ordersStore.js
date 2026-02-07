// src/shared/state/ordersStore.js
// История заказов (клиентская). НИКАКИХ импортов UI/роутера тут быть не должно.
// Store-слой хранит данные и даёт actions/selectors.
// UI (pages/components) уже решают, как это рисовать.

export function ordersStore() {
  // Список заказов: последний сверху
  let orders = [];

  return {
    selectors: {
      all: () => orders,
      count: () => orders.length,
      last: () => (orders.length ? orders[0] : null),
    },

    actions: {
      add(order) {
        // минимальная защита от мусора
        if (!order || !order.id) return;
        orders = [order, ...orders];
      },

      clear() {
        orders = [];
      },
    },
  };
}
