// src/modules/client/pages/feedback.js
// Страница "Связь" (спокойный premium):
// - рейтинг звёздами (1..5) + toast
// - сообщение владельцу (textarea)
// - быстрые действия: карта / написать владельцу / проблема с заказом (шаблон)
// - отправка payload в tg.sendData (потом бот отправит в канал)

import { renderHeader } from "../../../shared/ui/header.js";
import { toast } from "../../../shared/components/toast.js";
import { openCafeMapModal } from "../../../shared/components/mapModal.js";
import { CAFE } from "../../../config.js";

function getTgUser(tg) {
  try {
    const u = tg?.initDataUnsafe?.user;
    if (!u) return null;
    return {
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      username: u.username,
      language_code: u.language_code,
    };
  } catch {
    return null;
  }
}

function openOwnerChat(tg) {
  const username = CAFE.ownerTelegram;
  if (!username) {
    toast.error("Не задан ownerTelegram в config.js");
    return;
  }

  const url = `https://t.me/${username}`;

  // В Telegram WebApp предпочтительнее использовать openTelegramLink/openLink
  try {
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else if (tg?.openLink) tg.openLink(url);
    else window.open(url, "_blank");
  } catch {
    window.open(url, "_blank");
  }
}

export function renderFeedbackPage(ctx) {
  const { content, tg } = ctx;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="feedbackHeader"></div>
    </div>

    <div class="feedback-wrap">
      <!-- Рейтинг -->
      <div class="glass-lite feedback-card">
        <div class="fb-row">
          <div>
            <div class="fb-title">Как вам Malina Cafe?</div>
            <div class="muted fb-sub">Оценка помогает нам становиться лучше</div>
          </div>
          <div class="fb-stars" id="fbStars" aria-label="rating">
            ${[1,2,3,4,5].map(n => `
              <button class="star" data-star="${n}" type="button" aria-label="${n} stars">★</button>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Сообщение -->
      <div class="glass-lite feedback-card">
        <div class="fb-title">Сообщение владельцу</div>
        <div class="muted fb-sub">Идеи, пожелания, замечания — всё читаем</div>

        <textarea id="fbText" class="fb-textarea" placeholder="Напишите сообщение..."></textarea>

        <div class="fb-actions">
          <button class="primary" id="fbSendBtn">Отправить</button>
          <button class="ghost" id="fbOwnerBtn">Написать в Telegram</button>
        </div>

        <div class="muted fb-hint">
          Мы не спрашиваем телефон: профиль берём из Telegram. При необходимости позже добавим запрос контакта через бота.
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="fb-grid">
        <button class="glass-lite fb-tile press" id="tileMap" type="button">
          <div class="tile-ico">📍</div>
          <div class="tile-text">
            <div class="tile-title">Мы на карте</div>
            <div class="muted tile-sub">Адрес и маршрут</div>
          </div>
        </button>

        <button class="glass-lite fb-tile press" id="tileOwner" type="button">
          <div class="tile-ico">💬</div>
          <div class="tile-text">
            <div class="tile-title">Владелец</div>
            <div class="muted tile-sub">Написать в Telegram</div>
          </div>
        </button>

        <button class="glass-lite fb-tile press" id="tileProblem" type="button">
          <div class="tile-ico">🧾</div>
          <div class="tile-text">
            <div class="tile-title">Проблема с заказом</div>
            <div class="muted tile-sub">Шаблон сообщения</div>
          </div>
        </button>
      </div>
    </div>
  `;

  renderHeader(content.querySelector("#feedbackHeader"), { subtitle: "Связь" });

  // -------------------------
  // ⭐ Rating
  // -------------------------
  const starsWrap = content.querySelector("#fbStars");
  let selected = 0;

  function paintStars(value) {
    starsWrap.querySelectorAll(".star").forEach((btn) => {
      const n = Number(btn.dataset.star);
      btn.classList.toggle("on", n <= value);
    });
  }

  starsWrap.onclick = (e) => {
    const btn = e.target.closest(".star");
    if (!btn) return;
    selected = Number(btn.dataset.star);
    paintStars(selected);

    // Отправим рейтинг сразу (мелкий payload)
    const payload = {
      type: "feedback",
      kind: "rating",
      stars: selected,
      createdAt: Date.now(),
      user: getTgUser(tg),
    };

    if (tg?.sendData) tg.sendData(JSON.stringify(payload));
    toast.success("Спасибо за оценку ❤️");
  };

  // -------------------------
  // 💬 Message
  // -------------------------
  const fbText = content.querySelector("#fbText");
  const sendBtn = content.querySelector("#fbSendBtn");
  const ownerBtn = content.querySelector("#fbOwnerBtn");

  ownerBtn.onclick = () => openOwnerChat(tg);

  sendBtn.onclick = () => {
    const text = fbText.value.trim();
    if (!text) {
      toast.error("Напиши сообщение 🙂");
      return;
    }

    const payload = {
      type: "feedback",
      kind: "message",
      text,
      createdAt: Date.now(),
      user: getTgUser(tg),
    };

    if (tg?.sendData) tg.sendData(JSON.stringify(payload));
    fbText.value = "";
    toast.success("Отправлено ✅");
  };

  // -------------------------
  // ⚡ Quick actions
  // -------------------------
  content.querySelector("#tileMap").onclick = () => openCafeMapModal();
  content.querySelector("#tileOwner").onclick = () => openOwnerChat(tg);
  content.querySelector("#tileProblem").onclick = () => {
    // Просто удобный шаблон (потом свяжем с историей заказов/номером заказа)
    fbText.value =
      "Проблема с заказом:\n" +
      "- Что случилось:\n" +
      "- Когда заказывал:\n" +
      "- Что должно было быть:\n" +
      "- Как удобно связаться:\n";
    fbText.focus();
    toast.info("Заполнил шаблон — допиши детали ✍️");
  };

  // cleanup
  return () => {};
}
