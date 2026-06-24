export type ThemeColor = string | number;

export type Variants<T> = T & {
  styles?: Record<string, Partial<T>>;
};

// A per-field resolver. V = this field's resolved value type; T = the whole style type.
//   raw  — this field's raw authored value (undefined if absent)
//   def  — this field's value in the RESOLVED default object
//   self — the whole RAW object currently being resolved (default cfg OR a variant)
export type Resolver<V, T> = (raw: V | undefined, def: V, self: Partial<T>) => V;

// Every field must be present (no sparse schemas).
export type Schema<T> = { [K in keyof T]: Resolver<T[K], T> };

// raw → default (variant inherits resolved default's value)
export const inherit =
  <V, T>(): Resolver<V, T> =>
  (raw, def) =>
    raw ?? def;

// raw → constant (hard default; default object's value irrelevant)
export const value =
  <V, T>(c: V): Resolver<V, T> =>
  (raw) =>
    raw ?? c;

// raw → default → constant (optional authored, terminal fallback when both absent)
export const fallback =
  <V, T>(c: V): Resolver<V, T> =>
  (raw, def) =>
    raw ?? def ?? c;

// color: resolve through palette (string|number → number)
export const color =
  <T>(palette: Palette): Resolver<number, T> =>
  (raw: any, def: any) =>
    palette.resolve(raw ?? def);

export class StyleRegistry<TStyle> {
  protected readonly _default: TStyle;
  protected readonly _styles: Record<string, TStyle>;

  constructor(cfg: Record<string, any> & { styles?: Record<string, any> }, schema: Schema<TStyle>) {
    this._default = this._build(cfg, cfg as TStyle, schema);
    this._styles = {};
    if (cfg.styles) {
      for (const [name, variant] of Object.entries(cfg.styles)) {
        this._styles[name] = this._build(variant, this._default, schema);
      }
    }
  }

  private _build(raw: any, def: TStyle, schema: Schema<TStyle>): TStyle {
    const out = {} as TStyle;
    const keys = Object.keys(schema) as (keyof TStyle)[];
    for (const key of keys) {
      out[key] = schema[key](raw[key], def[key], raw);
    }
    return out;
  }

  resolve(style?: string): TStyle {
    if (!style) return this._default;
    return this._styles[style] ?? this._default;
  }
}

export interface RegistryConstructor<TStyle> {
  readonly key: string;
  new (cfg: unknown, palette: Palette): StyleRegistry<TStyle>;
}

export type RegistryStyle<T> = T extends RegistryConstructor<infer S> ? S : never;

export type PaletteConfig = Record<string, ThemeColor>;

export class Palette {
  private readonly _map: Record<string, number>;

  constructor(cfg: PaletteConfig) {
    this._map = {};
    for (const [key, value] of Object.entries(cfg)) {
      if (typeof value === "number") {
        this._map[key] = value;
      } else if (value in cfg) {
        const ref = cfg[value];
        this._map[key] = typeof ref === "number" ? ref : 0;
      } else {
        this._map[key] = 0;
      }
    }
  }

  resolve(color: ThemeColor | undefined): number {
    if (color === undefined) return this._map.default ?? 0;
    if (typeof color === "number") return color;
    return this._map[color] ?? this._map.default ?? 0;
  }
}
