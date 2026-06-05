import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "html-charset-header",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/" || req.url?.endsWith(".html")) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
          }
          next();
        });
      },
    },
  ],
  server: {
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
