export function createStore(slices) {
  const listeners = new Set();

  const store = {
    ...slices,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify() {
      listeners.forEach((fn) => fn());
    },
  };

  Object.values(slices).forEach((slice) => {
    const actions = slice.actions || {};
    Object.keys(actions).forEach((k) => {
      const orig = actions[k];
      actions[k] = (...args) => {
        const res = orig(...args);
        store.notify();
        return res;
      };
    });
  });

  return store;
}
