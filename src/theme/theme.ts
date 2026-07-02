import { Palette } from "./palette";
import type { ThemeContext, ThemeResources } from "./context";
import type { StyleMap, ThemedComponent, ThemeConfig } from "./config";

export class Theme {
  readonly resources: ThemeResources;
  readonly palette: Palette;
  private readonly _resolved: Record<string, { def: unknown; variants: Record<string, unknown> }> =
    {};

  constructor(config: ThemeConfig) {
    this.resources = config.resources;
    this.palette = new Palette(config.palette);
    const ctx: ThemeContext = { palette: this.palette };
    for (const c of config.components) {
      const cfg = (config as Record<string, StyleMap<unknown>>)[c.styleKey];
      if (!cfg) continue;
      const def = c.resolveStyle(ctx, cfg, cfg);
      const variants: Record<string, unknown> = {};
      for (const [name, v] of Object.entries(cfg.styles ?? {}))
        variants[name] = c.resolveStyle(ctx, v, cfg);
      this._resolved[c.styleKey] = { def, variants };
    }
  }

  resolve<C extends ThemedComponent>(cls: C, style?: string) {
    const entry = this._resolved[cls.styleKey]!;
    const v = style ? entry.variants[style] : undefined;
    return (v ?? entry.def) as ReturnType<C["resolveStyle"]>;
  }
}
