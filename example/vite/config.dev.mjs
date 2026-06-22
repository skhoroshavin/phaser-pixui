import { processAssetsDev } from "pixel-tools";
import { defineConfig } from "vite";
import pkg from "../../package.json" with { type: "json" };
import { assetsConfig } from "./assets.mjs";

export default defineConfig({
  base: "./",
  define: {
    PHASER_PIXUI_VERSION: JSON.stringify(pkg.version),
  },
  server: {
    port: 8080,
    open: true,
  },
  plugins: [processAssetsDev(assetsConfig)],
});
