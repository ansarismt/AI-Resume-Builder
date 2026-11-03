import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client"],
  },
  server: {
    host: "127.0.0.1",
    port: 8080,
    strictPort: true,
    watch: {
      ignored: [
        "**/.venv/**",
        "**/data/**",
        "**/ai/ml/artifacts/**",
        "**/dist/**",
        "**/.tanstack/**",
      ],
    },
  },
});
