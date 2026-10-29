import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base "./" + HashRouter: website chạy được ở bất kỳ đường dẫn GitHub Pages nào
// (https://<user>.github.io/<repo>/) mà không cần cấu hình tên repository.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/pdfjs-dist")) return "pdfjs";
          if (id.includes("node_modules/@xyflow") || id.includes("node_modules/@dagrejs")) return "graph";
          if (id.includes("node_modules/katex")) return "katex";
          if (/node_modules\/(react-markdown|remark-|rehype-|micromark|mdast-|hast-|unified|unist-)/.test(id)) return "markdown";
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return "react";
        },
      },
    },
  },
});
