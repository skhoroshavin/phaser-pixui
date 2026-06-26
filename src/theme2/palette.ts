export type PaletteConfig = Record<string, ThemeColor>;

export type ThemeColor = string | number;

export class Palette {
  private readonly _map: Record<string, number>;

  constructor(cfg: PaletteConfig) {
    this._map = {};
    for (const [key, value] of Object.entries(cfg)) {
      if (typeof value === "number") this._map[key] = value;
    }
  }

  resolve(color: ThemeColor | undefined): number {
    if (color === undefined) return this._map.default ?? 0;
    if (typeof color === "number") return color;
    return this._map[color] ?? this._map.default ?? 0;
  }
}
