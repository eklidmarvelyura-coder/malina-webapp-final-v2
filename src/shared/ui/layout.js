// src/shared/ui/layout.js
// Layout = каркас приложения.
// Создаёт 2 зоны:
// - sidebar (слева)
// - content (справа)
// Страницы будут рендериться внутрь content.

// src/shared/ui/layout.js
export function renderShell(root) {
  if (!root) throw new Error("Root element #app not found");

  root.innerHTML = `
    <div class="app">
      <aside class="sidebar" id="sidebar"></aside>
      <main class="content">
        <div class="page" id="content"></div>
      </main>
    </div>
  `;
}
