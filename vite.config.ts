import { sites } from "@openai/sites-vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __PWA_CACHE_VERSION__: JSON.stringify(`build-${Date.now()}`),
  },
  plugins: [react(), sites()],
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL("./index.html", import.meta.url)),
        "service-worker": fileURLToPath(new URL("./src/service-worker.ts", import.meta.url)),
      },
      output: {
        entryFileNames: (chunkInfo) => (
          chunkInfo.name === "service-worker"
            ? "service-worker.js"
            : "assets/[name]-[hash].js"
        ),
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
