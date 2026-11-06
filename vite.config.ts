import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor code in its own chunks, so app updates do not invalidate it.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("@tanstack")) return "router";
          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("sonner")) {
            return "ui";
          }
          if (id.includes("axios")) return "http";
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
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
