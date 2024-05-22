import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      // input: "src/main_vanilla.ts",
      input: "src/main_p5.ts",
    },
  },
});
