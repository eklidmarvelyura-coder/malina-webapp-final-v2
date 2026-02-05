// src/shared/data/products.js
// Здесь лежат ВСЕ товары меню. Мы вынесли их из страниц,
// чтобы:
// 1) не дублировать данные в разных местах
// 2) легко делать админ-панель редактирования меню позже
// 3) удобно считать сумму корзины (цена берётся отсюда)

export const PRODUCTS = [
  {
    id: 1,
    name: "Американо",
    price: 60,
    category: "coffee",
    description: "Классический чёрный кофе.",
    image: "assets/img/americano.jpg",
  },
  {
    id: 2,
    name: "Капучино",
    price: 65,
    category: "coffee",
    description: "Кофе с молочной пенкой.",
    image: "assets/img/cappuccino.jpg",
  },
  {
    id: 3,
    name: "Пирожок с капустой",
    price: 50,
    category: "bakery",
    description: "Домашняя выпечка, свежая каждый день.",
    image: "assets/img/pie.jpg",
  },
  {
    id: 4,
    name: "Маффин с черникой",
    price: 70,
    category: "bakery",
    description: "Нежный маффин с ягодами.",
    image: "assets/img/muffin.jpg",
  },
];

// Быстрый доступ по id: вместо products.find(...) 100 раз.
// Это пригодится, когда товаров станет 50+.
export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

// Категории — чтобы потом красиво фильтровать меню.
export const CATEGORIES = [
  { id: "all", title: "Все" },
  { id: "coffee", title: "Кофе" },
  { id: "bakery", title: "Выпечка" },
];
