import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    /* Inline any asset below 200 KB as a data URI so the built dist is a
     * fully self-contained bundle — this lets the single-file artifact
     * inline the Inter Variable woff2 files without any external fetch. */
    assetsInlineLimit: 200 * 1024,
  },
});
