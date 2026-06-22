import { processAssetsProd } from "pixel-tools";
import { defineConfig } from "vite";
import pkg from "../../package.json" with { type: "json" };
import { assetsConfig } from "./assets.mjs";

export default defineConfig({
  base: "./",
  logLevel: "warning",
  define: {
    PHASER_PIXUI_VERSION: JSON.stringify(pkg.version),
  },
  resolve: {
    dedupe: ["phaser"],
  },
  preview: {
    port: 8080,
  },
  plugins: [processAssetsProd(assetsConfig)],
});
