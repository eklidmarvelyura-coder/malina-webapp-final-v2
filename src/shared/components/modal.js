// src/shared/components/modal.js
// Это “контроллер” модалки:
// - createModal(): вставляет HTML один раз
// - open(product): показывает
// - close(): скрывает
// - onAdd/onRemove: кнопки +/− работают через callbacks

export function createProductModal({ onAdd, onRemove }) {
  // Вставим модалку 1 раз в конец body.
  // Дальше мы только обновляем контент и показываем/скрываем.
  const modal = document.createElement("div");
  modal.id = "productModal";
  modal.className = "modal hidden";

  modal.innerHTML = `
    <div class="modal-backdrop" data-action="close"></div>

    <div class="modal-content" role="dialog" aria-modal="true">
      <button class="modal-close" data-action="close" aria-label="Закрыть">✕</button>

      <div class="modal-img-wrapper">
        <img id="modalImage" alt="">
      </div>

      <h2 id="modalTitle"></h2>
      <p id="modalDescription"></p>

      <div class="modal-footer">
        <div id="modalPrice" class="modal-price"></div>

        <div class="controls">
          <button class="ctrl-btn" id="modalMinus">−</button>
          <span class="ctrl-count" id="modalCount">0</span>
          <button class="ctrl-btn" id="modalPlus">+</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const elImage = modal.querySelector("#modalImage");
  const elTitle = modal.querySelector("#modalTitle");
  const elDesc = modal.querySelector("#modalDescription");
  const elPrice = modal.querySelector("#modalPrice");
  const elCount = modal.querySelector("#modalCount");

  let currentProductId = null;

  function setCount(count) {
    elCount.textContent = String(count);
  }

  function open(product, count) {
    currentProductId = product.id;

    elImage.src = product.image;
    elImage.alt = product.name;

    elTitle.textContent = product.name;
    elDesc.textContent = product.description;
    elPrice.textContent = `${product.price} ฿`;

    setCount(count);

    // Вариант B: hidden -> active (transition)
    modal.classList.remove("hidden");
    // небольшой таймаут, чтобы браузер успел применить display и запустить transition
    setTimeout(() => modal.classList.add("active"), 10);
  }

  function close() {
    modal.classList.remove("active");
    // ждём окончание анимации, потом скрываем
    setTimeout(() => modal.classList.add("hidden"), 350);
    currentProductId = null;
  }

  // Клик по фону/крестику закрывает
  modal.addEventListener("click", (e) => {
    const action = e.target?.dataset?.action;
    if (action === "close") close();
  });

  // Кнопки +/-
  modal.querySelector("#modalPlus").addEventListener("click", () => {
    if (!currentProductId) return;
    onAdd(currentProductId);
  });

  modal.querySelector("#modalMinus").addEventListener("click", () => {
    if (!currentProductId) return;
    onRemove(currentProductId);
  });

  return {
    open,
    close,
    setCount,
    isOpen: () => !modal.classList.contains("hidden"),
    getCurrentId: () => currentProductId,
  };
}
