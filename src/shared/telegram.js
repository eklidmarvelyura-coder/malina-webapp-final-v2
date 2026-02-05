export function initTelegram() {
  const tg = window.Telegram?.WebApp;

  const safe = {
    isTelegram: !!tg,
    initData: tg?.initData || "",
    user: tg?.initDataUnsafe?.user || null,
    ready: () => tg?.ready?.(),
    showAlert: (msg) => (tg?.showAlert ? tg.showAlert(msg) : alert(msg)),
    sendData: (data) => (tg?.sendData ? tg.sendData(data) : console.log("sendData:", data)),
    MainButton: tg?.MainButton || null,
  };

  safe.ready();
  return safe;
}
