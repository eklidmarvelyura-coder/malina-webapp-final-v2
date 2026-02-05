const routes = new Map();

// регистрируем страницу: name -> render(ctx)
export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

// переходим на страницу
export function navigate(name, ctx) {
  const fn = routes.get(name);
  if (!fn) throw new Error(`Route not found: ${name}`);
  fn(ctx);
}
