export function initTelegram() {
  const tg = window.Telegram?.WebApp;

  // маленький хелпер: вызывает метод Telegram, а если нельзя — fallback
  const safeCall = (fn, fallback) => {
    try {
      if (typeof fn === "function") return fn();
    } catch (e) {
      // WebAppMethodUnsupported и похожие — просто уходим в fallback
    }
    return fallback();
  };

  const safe = {
    isTelegram: !!tg,
    initData: tg?.initData || "",
    user: tg?.initDataUnsafe?.user || null,

    ready: () => safeCall(() => tg.ready(), () => {}),

    showAlert: (msg) =>
      safeCall(() => tg.showAlert(msg), () => alert(msg)),

    // ✅ showPopup может отсутствовать или быть неподдержанным
    showPopup: (params) =>
      safeCall(
        () => tg.showPopup(params),
        () => {
          // fallback: простое окно подтверждения
          const title = params?.title ? params.title + "\n\n" : "";
          const message = params?.message || "";
          alert(title + message);
        }
      ),

    sendData: (data) =>
      safeCall(() => tg.sendData(data), () => console.log("sendData:", data)),

    MainButton: tg?.MainButton || null,
  };

  safe.ready();
  return safe;
}
