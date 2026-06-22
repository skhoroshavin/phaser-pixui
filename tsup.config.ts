import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  external: ["phaser"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  outDir: "dist",
});
