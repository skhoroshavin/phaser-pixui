export type ThemeColor = string | number;

export type ComponentTheme<T> = T & {
  styles?: Record<string, T>;
};

export class ResolvedComponentTheme<TStyle> {
  protected _default!: TStyle;
  protected _styles!: Record<string, TStyle>;

  resolve(style?: string): TStyle {
    if (!style) return this._default;
    return this._styles[style] ?? this._default;
  }
}

export type Palette = Record<string, ThemeColor>;

export class ResolvedPalette {
  private readonly _map: Record<string, number>;

  constructor(def: Palette) {
    this._map = {};
    for (const [key, value] of Object.entries(def)) {
      if (typeof value === "number") {
        this._map[key] = value;
      } else if (value in def) {
        const ref = def[value];
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
