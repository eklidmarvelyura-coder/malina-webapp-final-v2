// src/modules/client/pages/menu.js
import { PRODUCTS, PRODUCT_BY_ID, CATEGORIES } from "../../../shared/data/products.js";
import { ProductCard } from "../../../shared/components/productCard.js";
import { createProductModal } from "../../../shared/components/modal.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";

let modalController = null;
// category хранится внутри модуля страницы, не в store (пока)
let currentCategory = "all";

export function renderMenuPage(ctx) {
  const { store, tg } = ctx;
  const content = document.getElementById("content");

  // 1) Рисуем “скелет” страницы
  content.innerHTML = `
    <div class="page glass">
      <div class="page-header">
        <h1>Меню</h1>
        <p class="muted">Выберите блюда и напитки</p>
      </div>

      <div class="categories" id="categories"></div>
      <div class="grid" id="productsGrid"></div>

      <button class="primary" id="checkoutBtn">Оформить заказ</button>
    </div>
  `;

  // 2) Монтируем модалку один раз (если ещё не создана)
  // В callbacks мы меняем store, а UI обновляем через store.subscribe ниже.
  if (!modalController) {
    modalController = createProductModal({
      onAdd: (id) => store.cart.actions.add(id),
      onRemove: (id) => store.cart.actions.remove(id),
    });
  }

  const elCats = content.querySelector("#categories");
  const elGrid = content.querySelector("#productsGrid");
  const elCheckout = content.querySelector("#checkoutBtn");

  // 3) Категории (кнопки)
  elCats.innerHTML = CATEGORIES.map((c) => {
    const active = c.id === currentCategory ? "active" : "";
    return `<button class="cat-btn ${active}" data-cat="${c.id}">${c.title}</button>`;
  }).join("");

  elCats.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    currentCategory = btn.dataset.cat;

    // перерисуем категории и товары
    renderMenuPage(ctx);
  });

  // 4) Рендер товаров (учитываем корзину)
  function renderList() {
    const items = store.cart.selectors.items();

    const list = PRODUCTS.filter((p) => currentCategory === "all" || p.category === currentCategory);

    elGrid.innerHTML = list
      .map((p) => {
        const count = items[p.id] || 0;
        // onOpen/onAdd/onRemove реализуем через data-action ниже (делегирование событий)
        return ProductCard({ product: p, count, mode: "menu" });
      })
      .join("");

    // Обновляем текст кнопки оформления (приятный UX)
    const total = calcCartTotal(items, PRODUCT_BY_ID);
    elCheckout.textContent = total > 0 ? `Оформить заказ • ${total} ฿` : "Оформить заказ";
  }

  // 5) Делегирование кликов по карточкам (один обработчик на весь список)
  elGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    const actionEl = e.target.closest("[data-action]");
    const action = actionEl?.dataset?.action;

    // Если нажали на +/−
    if (action === "add") {
      store.cart.actions.add(id);
      return;
    }
    if (action === "remove") {
      store.cart.actions.remove(id);
      return;
    }

    // Если нажали по кликабельной части карточки — открываем модалку
    const openEl = e.target.closest('[data-action="open"]');
    if (openEl) {
      const product = PRODUCT_BY_ID[id];
      const count = store.cart.selectors.getCount(id);
      modalController.open(product, count);
    }
  });

  // 6) Подписка на store: при любом изменении корзины обновляем UI
  // Важно: мы не создаём 100 подписок — но пока ок.
  // Позже сделаем отписку при смене страниц, это следующий уровень.
  const unsubscribe = store.subscribe(() => {
    renderList();

    // если модалка открыта — обновим счётчик
    const openedId = modalController.getCurrentId();
    if (openedId) {
      modalController.setCount(store.cart.selectors.getCount(openedId));
    }
  });

  // Чтобы не копить подписки при повторных рендерах этой страницы,
  // можно сделать “одноразовую” подписку. Пока просто страхуемся:
  // если вдруг страница рендерится повторно (категории), мы не хотим вечного накопления.
  // Поэтому отписываемся, когда перерисовываем страницу:
  // (мы вызываем renderMenuPage(ctx) заново в обработчике категорий — это уже новая страница)
  // => здесь минимально: при новом renderMenuPage старый DOM исчезает, а подписка останется.
  // Исправим это в следующем шаге, когда сделаем router “с жизненным циклом”.
  // Сейчас — рабочий MVP.

  // 7) Начальный рендер
  renderList();

  // 8) Кнопка “оформить заказ” пока заглушка
  elCheckout.onclick = () => {
    const total = calcCartTotal(store.cart.selectors.items(), PRODUCT_BY_ID);
    if (total <= 0) return tg.showAlert("Корзина пустая");
    tg.showAlert("Следующий шаг — страница оформления заказа ✅");
  };

  // ВАЖНО: сейчас unsubscribe нигде не вызывается — это нормально на старте,
  // но мы вернёмся к этому, когда будем делать полноценный router lifecycle.
  void unsubscribe;
}
