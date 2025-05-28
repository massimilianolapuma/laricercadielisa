import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "coverage/", "*.config.js"],
    },
    // Mock Chrome APIs for testing
    mockReset: true,
    clearMocks: true,
  },
  define: {
    // Define global chrome object for tests
    chrome: {},
  },
});
