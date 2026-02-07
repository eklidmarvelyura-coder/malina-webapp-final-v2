// src/shared/components/toast.js
// Мини-тосты (как в нормальных приложениях)
// Использование:
//   toast.success("Готово ✅")
//   toast.error("Ошибка")
//   toast.info("Сообщение")

function ensureRoot() {
  let root = document.getElementById("toastRoot");
  if (root) return root;

  root = document.createElement("div");
  root.id = "toastRoot";
  root.className = "toast-root";
  document.body.appendChild(root);
  return root;
}

function show(message, type = "info", ms = 2400) {
  const root = ensureRoot();

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;

  root.appendChild(el);

  // появление
  requestAnimationFrame(() => el.classList.add("show"));

  // исчезновение
  const t1 = setTimeout(() => {
    el.classList.remove("show");
    const t2 = setTimeout(() => el.remove(), 220);
    el._t2 = t2;
  }, ms);

  el._t1 = t1;
  return el;
}

export const toast = {
  info: (m, ms) => show(m, "info", ms),
  success: (m, ms) => show(m, "success", ms),
  error: (m, ms) => show(m, "error", ms),
};
