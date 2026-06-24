import { Palette } from "./palette";
import type { ThemeContext, ThemeResources } from "./context";
import { resolveStyle, type ResolvedStyle, type StyleResolver, StyleMap } from "./style";
import { ThemeBinding, ThemedComponent } from "./binding.ts";
import { ThemeConfig } from "./config.ts";

export class Theme {
  readonly resources: ThemeResources;
  readonly palette: Palette;
  private readonly _resolved: Record<string, ResolvedVariants<unknown, StyleResolver<unknown>>> =
    {};

  constructor(config: ThemeConfig) {
    this.resources = config.resources;
    this.palette = new Palette(config.palette);
    for (const c of config.components) {
      const cfg = (config as Record<string, unknown>)[c.binding.key];
      if (cfg === undefined) continue;
      this._resolved[c.binding.key] = this.resolveVariants(
        cfg as StyleMap<unknown>,
        c.binding.resolver,
      );
    }
  }

  resolve<C extends ThemedComponent>(cls: C, style?: string): BindingStyle<C["binding"]> {
    const v = this._resolved[cls.binding.key]!;
    const r = style ? v.variants[style] : undefined;
    return (r ?? v.def) as BindingStyle<C["binding"]>;
  }

  private resolveVariants<T, R extends StyleResolver<T>>(
    cfg: StyleMap<T>,
    resolver: R,
  ): ResolvedVariants<T, R> {
    const ctx: ThemeContext = { palette: this.palette };
    const def = resolveStyle(ctx, cfg, cfg as ResolvedStyle<T, R>, resolver);
    const variants: Record<string, ResolvedStyle<T, R>> = {};
    if (cfg.styles) {
      for (const [name, v] of Object.entries(cfg.styles)) {
        variants[name] = resolveStyle(ctx, v, def, resolver);
      }
    }
    return { def, variants };
  }
}

type BindingStyle<E> =
  E extends ThemeBinding<string, infer T, infer R> ? ResolvedStyle<T, R> : never;

type ResolvedVariants<T, R extends StyleResolver<T>> = {
  readonly def: ResolvedStyle<T, R>;
  readonly variants: Record<string, ResolvedStyle<T, R>>;
};
