export function renderCartPage() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="page glass">
      <h1>Корзина</h1>
      <p>Следующим шагом сюда перенесём твою реальную корзину (карточки + сумма).</p>
      <button class="primary">Оформить заказ</button>
    </div>
  `;
}
