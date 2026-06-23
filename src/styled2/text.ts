import { TextAlign } from "../util/align.js";
import type {
  ComponentTheme,
  ResolvedComponentTheme,
  ThemeColor,
  ResolvedPalette,
} from "./theme.js";

export type TextStyle = {
  font: string;
  tint: ThemeColor;
  align: TextAlign;
};

export type TextTheme = ComponentTheme<TextStyle>;
export type ResolvedTextTheme = ResolvedComponentTheme<TextStyle>;

function resolveColor(color: ThemeColor | undefined, palette: ResolvedPalette): number {
  if (color === undefined) return palette.default ?? 0;
  if (typeof color === "number") return color;
  if (color in palette) return palette[color]!;
  return palette.default ?? 0;
}

export function resolveTextTheme(def: TextTheme, palette: ResolvedPalette): ResolvedTextTheme {
  const defaults: TextStyle = {
    font: def.font ?? "",
    tint: resolveColor(def.tint, palette),
    align: def.align ?? TextAlign.Left,
  };

  const styles: Record<string, TextStyle> = {};
  if (def.styles) {
    for (const [name, s] of Object.entries(def.styles)) {
      styles[name] = {
        font: s.font ?? defaults.font,
        tint: resolveColor(s.tint ?? def.tint, palette),
        align: s.align ?? defaults.align,
      };
    }
  }

  return { default: defaults, styles };
}
