import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    exclude: ["**/node_modules/**", "**/dist/**", "favicon-debug.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        "coverage/",
        "*.config.js",
        "favicon-debug.test.js",
      ],
      reportsDirectory: "./coverage",
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
