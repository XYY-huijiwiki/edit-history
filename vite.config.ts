import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { visualizer } from "rollup-plugin-visualizer";

const appId = "dcb40fa"; // Definiere die App-ID hier

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  server: {
    cors: true,
  },
  build: {
    manifest: true,
    rollupOptions: {
      plugins: [visualizer({ filename: "./dist/stats.html" })],
    },
  },
  define: {
    __APP_ID__: JSON.stringify(appId),
  },
});
