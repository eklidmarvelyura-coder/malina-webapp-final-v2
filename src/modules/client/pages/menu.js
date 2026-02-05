export function renderMenuPage({ tg }) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="page glass">
      <h1>Меню</h1>
      <p>Если ты видишь это — модульная структура работает.</p>
      <button class="primary" id="testBtn">Тест Telegram Alert</button>
    </div>
  `;

  document.getElementById("testBtn").onclick = () => {
    tg.showAlert("WebApp живой ✅");
  };
}
