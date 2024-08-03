import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/riot-api": {
        target: "https://na1.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/riot-api/, ""),
      },
    },
  },
});
