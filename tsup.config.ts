import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'], // Build for CommonJS, ES Modules, and IIFE (global bundle)
  external: ['phaser'], // Don't bundle Phaser, as it's a peer dependency
  dts: true, // Generate declaration files
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  outDir: 'dist',
  globalName: 'PhaserPixUI', // Global variable name for IIFE bundle
});