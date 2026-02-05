export function renderFeedbackPage({ tg }) {
  const content = document.getElementById("content");
  content.innerHTML = `
  <div class="page glass">
    <div class="page-header">
      <div class="header-left">
        <h1>🍓 Malina Cafe</h1>
        <p class="muted">Связь с нами</p>
      </div>
    </div>

    <div class="feedback-form">
      <label class="muted">Ваше сообщение</label>
      <textarea id="fbText" class="input" placeholder="Напишите сообщение"></textarea>
      <button id="fbSend" class="primary">Отправить</button>
    </div>
  </div>
`;


  document.getElementById("fbSend").onclick = () => {
    const text = document.getElementById("fbText").value.trim();
    if (!text) return tg.showAlert("Введите текст");
    tg.sendData(JSON.stringify({ type: "feedback", text }));
    tg.showAlert("Отправлено!");
    document.getElementById("fbText").value = "";
  };
}
