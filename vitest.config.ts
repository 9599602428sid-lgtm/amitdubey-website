import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      CASE_ENCRYPTION_KEY: "ab".repeat(32),
      VITEST: "true",
    },
  },
});
