import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve("front-end", "src"),
    },
  },
  root: path.resolve(".", "front-end"),
  build: {
    outDir: path.resolve("dist/public"),
    emptyOutDir: true,
  },
});
