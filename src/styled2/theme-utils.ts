export type ThemeColor = string | number;

export type Variants<T> = T & {
  styles?: Record<string, Partial<T>>;
};

export type StyleResolver<TInput, TResolved> = {
  resolve(cfg: TInput, palette: Palette): TResolved;
};

export class StyleRegistry<TStyle> {
  protected _default!: TStyle;
  protected _styles!: Record<string, TStyle>;

  resolve(style?: string): TStyle {
    if (!style) return this._default;
    return this._styles[style] ?? this._default;
  }
}

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
