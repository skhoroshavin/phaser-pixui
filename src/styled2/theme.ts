import { TextTheme, type TextThemeConfig } from "./text.js";
import { FrameTheme, type FrameThemeConfig } from "./frame.js";
import {
  Palette,
  StyleRegistry,
  type PaletteConfig,
  type RegistryConstructor,
  type RegistryStyle,
} from "./theme-utils.js";

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

  constructor(cfg: ThemeConfig, registries?: RegistryConstructor<unknown>[]) {
    this.resources = cfg.resources;
    this.palette = new Palette(cfg.palette);
    this.text = new TextTheme(cfg.text, this.palette);
    this.frame = new FrameTheme(cfg.frame);
    this.components = {};
    if (registries && cfg.components) {
      for (const Registry of registries) {
        const slice = cfg.components[Registry.key];
        if (slice !== undefined) {
          this.components[Registry.key] = new Registry(slice, this.palette);
        }
      }
    }
  }

  resolve<T extends RegistryConstructor<unknown>>(registry: T, style?: string): RegistryStyle<T> {
    return (this.components[registry.key] as StyleRegistry<RegistryStyle<T>>).resolve(style);
  }
}
