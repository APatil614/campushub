import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend component/integration suite.
 *
 * Mirrors the `@` and `declarations` aliases from `vite.config.js` so tests
 * import the same modules the app does. The DOM environment is supplied by the
 * `test` script (`vitest run --environment jsdom`); this file only wires the
 * aliases and the jest-dom setup module.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    // Pin the worker pool explicitly. Some sandboxes export VITEST_MIN_THREADS
    // / VITEST_MAX_THREADS that conflict with Vitest's defaults and abort the
    // run before any test is collected.
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 1,
      },
    },
  },
});
