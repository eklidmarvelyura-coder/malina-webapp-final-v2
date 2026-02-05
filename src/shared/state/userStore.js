export function userStore() {
  let role = "client"; // client | staff | admin

  return {
    selectors: {
      role: () => role,
    },
    actions: {
      setRole: (r) => (role = r),
    },
  };
}
