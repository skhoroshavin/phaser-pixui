import { TextTheme, type TextThemeConfig } from "./text.js";
import { FrameTheme, type FrameThemeConfig } from "./frame.js";
import { Palette, type PaletteConfig, type StyleResolver } from "./theme-utils.js";

export type ThemeResources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};

export type ThemeConfig = {
  resources: ThemeResources;
  palette: PaletteConfig;
  text: TextThemeConfig;
  frame: FrameThemeConfig;
  components?: Record<string, unknown>;
};

export class Theme {
  readonly resources: ThemeResources;
  readonly palette: Palette;
  readonly text: TextTheme;
  readonly frame: FrameTheme;
  readonly components: Record<string, unknown>;

  constructor(cfg: ThemeConfig, resolvers?: Record<string, StyleResolver<unknown, unknown>>) {
    this.resources = cfg.resources;
    this.palette = new Palette(cfg.palette);
    this.text = new TextTheme(cfg.text, this.palette);
    this.frame = new FrameTheme(cfg.frame);
    this.components = {};
    if (resolvers && cfg.components) {
      for (const [key, mod] of Object.entries(resolvers)) {
        const slice = cfg.components[key];
        if (slice !== undefined) {
          this.components[key] = mod.resolve(slice, this.palette);
        }
      }
    }
  }
}
