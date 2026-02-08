// src/modules/client/pages/feedback.js
// Связь (упрощённо и по делу):
// - рейтинг доступен только 1 раз на 1 заказ
// - сообщение владельцу
// - кнопки “Отправить” и “Написать в Telegram” — одинаковые малиновые
//
// Рейтинг:
// - lastOrderId берём из localStorage (устанавливается при успешном заказе)
// - ratedOrderId хранит, какой заказ уже оценён
// - если ratedOrderId === lastOrderId → рейтинг заблокирован до нового заказа
//
// При выставлении рейтинга отправляем payload в бот:
// { type:"rating", orderId, stars, user:{username...} }

import { renderHeader } from "../../../shared/ui/header.js";
import { toast } from "../../../shared/components/toast.js";
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

  const tgUser = getTgUser(tg);
  const userKey = tgUser?.id ? String(tgUser.id) : "anon";

  // ✅ Рейтинг: 1 раз на заказ
  const lastOrderId = localStorage.getItem(`malina:lastOrder:${userKey}`);   // ставим в checkout
  const ratedOrderId = localStorage.getItem(`malina:ratedOrder:${userKey}`); // ставим после оценки
  const canRate = !!lastOrderId && ratedOrderId !== lastOrderId;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="feedbackHeader"></div>
    </div>

    <div class="feedback-wrap">
      <!-- Рейтинг -->
      <div class="glass-lite feedback-card">
        <div class="fb-row">
          <div>
            <div class="fb-title">Оценка</div>
            <div class="muted fb-sub">
              ${
                canRate
                  ? "Оценку можно поставить один раз после каждого заказа"
                  : lastOrderId
                    ? "Вы уже оценили последний заказ. Новая оценка будет доступна после следующего заказа."
                    : "Оценка станет доступна после оформления заказа."
              }
            </div>
          </div>

          <div class="fb-stars ${canRate ? "" : "disabled"}" id="fbStars" aria-label="rating">
            ${[1,2,3,4,5].map(n => `
              <button class="star" data-star="${n}" type="button" aria-label="${n} stars">★</button>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Сообщение владельцу -->
      <div class="glass-lite feedback-card">
        <div class="fb-title">Сообщение владельцу</div>
        <div class="muted fb-sub">Идеи, пожелания, замечания — всё читаем</div>

        <textarea id="fbText" class="fb-textarea" placeholder="Напишите сообщение..."></textarea>

        <div class="fb-actions">
          <button class="primary" id="fbSendBtn">Отправить</button>
          <button class="primary" id="fbOwnerBtn">Написать в Telegram</button>
        </div>

        <div class="muted fb-hint">
          Мы используем профиль Telegram для идентификации. Телефон Telegram автоматически не отдаёт — позже добавим запрос контакта через бота.
        </div>
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
    if (!canRate) return;

    const btn = e.target.closest(".star");
    if (!btn) return;

    selected = Number(btn.dataset.star);
    paintStars(selected);

    // ✅ сохраняем, что этот заказ уже оценён
    localStorage.setItem(`malina:ratedOrder:${userKey}`, String(lastOrderId));

    // ✅ отправляем в бота (дальше бот пишет админу)
    const payload = {
      type: "rating",
      orderId: Number(lastOrderId),
      stars: selected,
      createdAt: Date.now(),
      user: tgUser,
    };

    if (tg?.sendData) tg.sendData(JSON.stringify(payload));
    else console.log("RATING PAYLOAD:", payload);

    toast.success("Спасибо за оценку ❤️"); // можно потом заменить на более нейтральное сообщение, если не хотим акцентировать внимание на сердечках :)
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
      user: tgUser,
    };

    if (tg?.sendData) tg.sendData(JSON.stringify(payload));
    else console.log("FEEDBACK PAYLOAD:", payload);

    fbText.value = "";
    toast.success("Отправлено ✅");
  };

  return () => {};
}
