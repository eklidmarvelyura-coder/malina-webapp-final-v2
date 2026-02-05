// src/shared/components/productCard.js
// Важно: кнопки +/− имеют data-action, а карточка имеет data-id.
// Menu/Cart страницы ловят клики делегированием и меняют store.

export function ProductCard({ product, count, mode = "menu" }) {
  const priceText = mode === "cart"
    ? `${product.price * count} ฿`
    : `${product.price} ฿`;

  return `
    <div class="card product-card" data-id="${product.id}">
      <div class="card-click" data-action="open">
        <img class="card-img" src="${product.image}" alt="${product.name}" />
        <h3 class="card-title">${product.name}</h3>
        <div class="price">${priceText}</div>
      </div>

      <div class="controls">
        <button class="ctrl-btn" data-action="remove" type="button">−</button>
        <span class="ctrl-count">${count}</span>
        <button class="ctrl-btn" data-action="add" type="button">+</button>
      </div>
    </div>
  `;
}
