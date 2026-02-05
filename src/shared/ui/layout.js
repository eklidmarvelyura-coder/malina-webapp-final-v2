export function renderShell(root) {
  root.innerHTML = `
    <div class="app-shell">
      <aside id="sidebar" class="sidebar"></aside>
      <main id="content" class="content"></main>
    </div>
  `;
}
