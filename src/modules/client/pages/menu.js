import { renderHeader } from "../../../shared/ui/header.js";
import { PRODUCTS, PRODUCT_BY_ID, CATEGORIES } from "../../../shared/data/products.js";
import { ProductCard } from "../../../shared/components/productCard.js";
import { createProductModal } from "../../../shared/components/modal.js";
import { calcCartTotal } from "../../../shared/utils/cartTotals.js";
import { navigate } from "../../../shared/router.js";


let modalController = null;
let currentCategory = "all";

export function renderMenuPage(ctx) {
  const { store, tg, content } = ctx;
  


  content.innerHTML = `
    <div class="menu-sticky glass" id="menuSticky"></div>
    <div class="categories" id="categories"></div>
    <div class="grid" id="productsGrid"></div>

    <div class="menu-footer glass">
      <button class="primary" id="checkoutBtn">Оформить заказ</button>
    </div>
  `;

  // общий header
  renderHeader(document.getElementById("menuSticky"), {
    subtitle: "Кофе и выпечка с доставкой",
  });

  if (!modalController) {
    modalController = createProductModal({
      onAdd: (id) => store.cart.actions.add(id),
      onRemove: (id) => store.cart.actions.remove(id),
    });
  }

  const elCats = document.getElementById("categories");
  const elGrid = document.getElementById("productsGrid");
  const elCheckout = document.getElementById("checkoutBtn");
  const checkoutBtn = content.querySelector("#menuCheckoutBtn");

  // Категории
  elCats.innerHTML = CATEGORIES.map((c) => {
    const active = c.id === currentCategory ? "active" : "";
    return `<button class="cat-btn ${active}" data-cat="${c.id}">${c.title}</button>`;
  }).join("");

  elCats.onclick = (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    currentCategory = btn.dataset.cat;
    // перерисуем страницу (через ctx.render)
    ctx.render("menu");
  };

  function renderList() {
    const items = store.cart.selectors.items();
    const list = PRODUCTS.filter(
      (p) => currentCategory === "all" || p.category === currentCategory
    );

    elGrid.innerHTML = list
      .map((p) => ProductCard({ product: p, count: items[p.id] || 0, mode: "menu" }))
      .join("");

    const total = calcCartTotal(items, PRODUCT_BY_ID);

     // текст + доступность кнопки
     elCheckout.textContent = total > 0 ? `Оформить заказ • ${total} ฿` : "Оформить заказ";
     elCheckout.disabled = total <= 0;


    const openedId = modalController.getCurrentId();
    if (openedId) modalController.setCount(store.cart.selectors.getCount(openedId));
  }

  const onGridClick = (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    const action = e.target.closest("[data-action]")?.dataset?.action;

    if (action === "add") return store.cart.actions.add(id);
    if (action === "remove") return store.cart.actions.remove(id);

    if (e.target.closest('[data-action="open"]')) {
      modalController.open(PRODUCT_BY_ID[id], store.cart.selectors.getCount(id));
    }
  };

  elGrid.addEventListener("click", onGridClick);

  elCheckout.onclick = () => {
  const total = calcCartTotal(store.cart.selectors.items(), PRODUCT_BY_ID);
  if (total <= 0) return; // кнопка и так disabled

  // Переходим на checkout page
  navigate("checkout", ctx);
};


  // Подписка на store
  const unsub = store.subscribe(renderList);
  renderList();

  // cleanup: отписка + снятие обработчика
  return () => {
    try { unsub && unsub(); } catch (_) {}
    try { elGrid.removeEventListener("click", onGridClick); } catch (_) {}
  };
}
