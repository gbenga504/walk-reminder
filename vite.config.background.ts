import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false, // We don't need to copy the public directory. It is already handled by vite.config.ts

    lib: {
      entry: resolve(__dirname, "src/background.ts"),
      name: "BackgroundScript",
      fileName: () => "background.js",
      formats: ["umd"],
    },
  },
});
