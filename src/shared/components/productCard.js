// src/shared/components/productCard.js
// Компонент карточки товара.
// Мы возвращаем HTML-строку, чтобы быстро собирать список.
// Позже можно перейти на DOM-элементы, но строка на старте проще.

export function ProductCard({ product, count, onOpen, onAdd, onRemove, mode = "menu" }) {
  // mode = "menu" | "cart"
  // В меню показываем цену за 1 шт, в корзине можно показывать сумму за товар.
  const priceText =
    mode === "cart" ? `${product.price * count} ฿` : `${product.price} ฿`;

  // Важно: клики по кнопкам НЕ должны открывать modal, поэтому stopPropagation.
  return `
    <div class="card product-card" data-id="${product.id}">
      <div class="card-click" data-action="open">
        <img class="card-img" src="${product.image}" alt="${product.name}" />
        <h3 class="card-title">${product.name}</h3>
        <div class="price">${priceText}</div>
      </div>

      <div class="controls">
        <button class="ctrl-btn" data-action="remove" aria-label="Уменьшить">−</button>
        <span class="ctrl-count">${count}</span>
        <button class="ctrl-btn" data-action="add" aria-label="Увеличить">+</button>
      </div>
    </div>
  `;
}
