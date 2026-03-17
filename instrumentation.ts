// Fix for Bun's broken localStorage polyfill
// This runs before any application code
export async function register() {
  if (typeof window === "undefined" && typeof global !== "undefined") {
    // Mock localStorage for server-side rendering
    const localStorageMock = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };

    // @ts-ignore
    global.localStorage = localStorageMock;
    // @ts-ignore
    global.sessionStorage = localStorageMock;
  }
}
