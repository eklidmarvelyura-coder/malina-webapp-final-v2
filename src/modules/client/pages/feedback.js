// src/modules/client/pages/feedback.js
// Связь (минимально, без тавтологии):
// - рейтинг: 1 раз на каждый новый заказ
// - сообщение владельцу
// - обе кнопки одинаковые (primary)
//
// Логика рейтинга:
// lastOrderId = id последнего заказа (ставим в checkout.js)
// ratedOrderId = id заказа, который уже оценён
// ratingStars = выбранные звёзды (чтобы показывать, что клиент ставил)

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

  // ✅ читаем “последний заказ” и “уже оцененный заказ”
  const lastOrderId = localStorage.getItem(`malina:lastOrder:${userKey}`);     // ставим в checkout.js
  const ratedOrderId = localStorage.getItem(`malina:ratedOrder:${userKey}`);  // ставим после клика
  const savedStars = Number(localStorage.getItem(`malina:ratingStars:${userKey}`) || 0);

  // Можно оценить, если:
  // - есть последний заказ
  // - и этот последний заказ ещё не оценён
  const canRate = !!lastOrderId && ratedOrderId !== lastOrderId;

  content.innerHTML = `
    <div class="menu-sticky glass">
      <div id="feedbackHeader"></div>
    </div>

    <div class="feedback-wrap">
      <div class="glass-lite feedback-card">
        <div class="fb-row">
          <div>
            <div class="fb-title">Оценка</div>
            <div class="muted fb-sub" id="rateHint"></div>
          </div>

          <div class="fb-stars ${canRate ? "" : "disabled"}" id="fbStars">
            ${[1,2,3,4,5].map(n => `
              <button class="star" data-star="${n}" type="button">★</button>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="glass-lite feedback-card">
        <div class="fb-title">Сообщение владельцу</div>
        <div class="muted fb-sub">Идеи, пожелания, замечания — всё читаем</div>

        <textarea id="fbText" class="fb-textarea" placeholder="Напишите сообщение..."></textarea>

        <div class="fb-actions">
          <button class="primary" id="fbSendBtn">Отправить</button>
          <button class="primary" id="fbOwnerBtn">Написать в Telegram</button>
        </div>

        <div class="muted fb-hint">
          Профиль берём из Telegram. Телефон Telegram автоматически не отдаёт —
          позже добавим запрос контакта через бота.
        </div>
      </div>
    </div>
  `;

  renderHeader(content.querySelector("#feedbackHeader"), { subtitle: "Связь" });

  // ---------- рейтинг ----------
  const starsWrap = content.querySelector("#fbStars");
  const hintEl = content.querySelector("#rateHint");

  // текст подсказки
  if (!lastOrderId) {
    hintEl.textContent = "Оценка станет доступна после оформления заказа.";
  } else if (!canRate) {
    hintEl.textContent = "Вы уже оценили последний заказ. Новая оценка появится после следующего заказа.";
  } else {
    hintEl.textContent = "Можно поставить оценку один раз после каждого заказа.";
  }

  function paintStars(value) {
    starsWrap.querySelectorAll(".star").forEach((btn) => {
      const n = Number(btn.dataset.star);
      btn.classList.toggle("on", n <= value);
    });
  }

  // показываем сохранённую оценку, если она есть
  if (savedStars > 0) paintStars(savedStars);

  // клик по звёздам
  starsWrap.onclick = (e) => {
    if (!canRate) return; // уже оценивал — блок

    const btn = e.target.closest(".star");
    if (!btn) return;

    const stars = Number(btn.dataset.star);

    // ✅ фиксируем оценку: 1 раз на последний заказ
    localStorage.setItem(`malina:ratedOrder:${userKey}`, String(lastOrderId));
    localStorage.setItem(`malina:ratingStars:${userKey}`, String(stars));

    paintStars(stars);

    // ✅ сразу блокируем UI, чтобы нельзя было менять “в этом же заказе”
    starsWrap.classList.add("disabled");
    hintEl.textContent = "Спасибо! Оценка сохранена. Изменить можно после следующего заказа.";

    // ✅ payload в бота (бот потом уведомит админа)
    const payload = {
      type: "rating",
      orderId: String(lastOrderId),
      stars,
      createdAt: Date.now(),
      user: tgUser,
    };

    if (tg?.sendData) tg.sendData(JSON.stringify(payload));
    else console.log("RATING PAYLOAD:", payload);

    toast.success("Спасибо за оценку ❤️");
  };

  // ---------- сообщение владельцу ----------
  const fbText = content.querySelector("#fbText");
  content.querySelector("#fbOwnerBtn").onclick = () => openOwnerChat(tg);

  content.querySelector("#fbSendBtn").onclick = () => {
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
