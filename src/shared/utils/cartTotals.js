// src/shared/utils/cartTotals.js
// У нас корзина хранит только количества (productId -> count).
// Чтобы посчитать сумму, нам нужны цены из PRODUCTS.

export function calcCartTotal(itemsMap, productById) {
  let total = 0;

  for (const [idStr, count] of Object.entries(itemsMap)) {
    const id = Number(idStr);
    const product = productById[id];
    if (!product) continue;

    total += product.price * count;
  }

  return total;
}
