export function cartStore() {
  // items: { [productId]: count }
  let items = {};

  return {
    selectors: {
      items: () => items,
      count: () => Object.values(items).reduce((a, b) => a + b, 0),
    },
    actions: {
      add: (id) => (items[id] = (items[id] || 0) + 1),
      remove: (id) => {
        if (!items[id]) return;
        items[id]--;
        if (items[id] <= 0) delete items[id];
      },
      clear: () => (items = {}),
    },
  };
}
