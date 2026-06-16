import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills({ include: ["crypto"] })],
  server: {
    host: true,
  },
  preview: {
    allowedHosts: ["checkout.orafi.app"],
  },
  resolve: {
    alias: {
      "@orafi/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "node:buffer": "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  define: {
    global: "globalThis",
  },
});