import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Get dirname in CommonJS compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Removed the Replit plugins that cause ESM/CJS compatibility issues
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Ensure assets use relative paths
    assetsDir: "assets",
    // Make sure the base URL is set correctly for Netlify
    assetsInlineLimit: 4096,
  },
  // Set the base URL to work with Netlify
  base: "/",
});
