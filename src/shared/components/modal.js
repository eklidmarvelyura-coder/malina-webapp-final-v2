// src/shared/components/modal.js
// Модалка как "bottom sheet": всегда поверх, всегда по центру снизу.
// Важно: внутри модалки используем modal-controls, чтобы не конфликтовать с .controls на карточках.

export function createProductModal({ onAdd, onRemove }) {
  const modal = document.createElement("div");
  modal.id = "productModal";
  modal.className = "modal hidden";

  modal.innerHTML = `
    <div class="modal-backdrop" data-action="close"></div>

    <div class="modal-sheet" role="dialog" aria-modal="true">
      <button class="modal-close" data-action="close" aria-label="Закрыть">✕</button>

      <img id="modalImage" class="modal-image" alt="" />

      <div class="modal-body">
        <h2 id="modalTitle" class="modal-title"></h2>
        <p id="modalDescription" class="modal-desc"></p>

        <div class="modal-row">
          <div id="modalPrice" class="modal-price"></div>

          <div class="modal-controls">
            <button class="ctrl-btn" id="modalMinus">−</button>
            <span class="ctrl-count" id="modalCount">0</span>
            <button class="ctrl-btn" id="modalPlus">+</button>
          </div>
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

    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("active"));
  }

  function close() {
    modal.classList.remove("active");
    setTimeout(() => modal.classList.add("hidden"), 220);
    currentProductId = null;
  }

  // Закрытие по фону/крестику
  modal.addEventListener("click", (e) => {
    const action = e.target?.dataset?.action;
    if (action === "close") close();
  });

  // +/-
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
    getCurrentId: () => currentProductId,
  };
}
