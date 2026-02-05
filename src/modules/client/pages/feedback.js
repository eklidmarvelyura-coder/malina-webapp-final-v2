export function renderFeedbackPage({ tg }) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="page glass">
      <h1>Связь</h1>
      <textarea id="fbText" class="input" placeholder="Напишите сообщение"></textarea>
      <button id="fbSend" class="primary">Отправить</button>
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
