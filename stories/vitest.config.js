import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // Use jsdom for DOM-related tests
    globals: true, // Enable global variables like describe, it, expect
    setupFiles: "tests/setup.js", // Optional: Path to a setup file for global mocks
    coverage: {
      provider: "c8", // Use 'c8' for coverage reporting
      reporter: ["text", "json", "html"], // Choose the coverage reporters you want
      include: ["src/**/*.js"],
      reportsDirectory: "coverage", // Directory to save coverage reports
      exclude: ["node_modules/", "tests/", "**/*.json"], // Exclude test files from coverage
    },
    include: ["**/*.{test,spec}.{js,ts}"],
    watch: true,
  },
});
