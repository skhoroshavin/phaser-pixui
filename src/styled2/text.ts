import { TextAlign } from "../util/align.js";
import type { ComponentTheme, ResolvedComponentTheme } from "./theme.js";

export type TextStyle = {
  font: string;
  tint: number;
  align: TextAlign;
};

export type TextTheme = ComponentTheme<TextStyle>;
export type ResolvedTextTheme = ResolvedComponentTheme<TextStyle>;

export function resolveTextTheme(
  def: TextTheme,
  palette: Record<string, number>,
): ResolvedTextTheme {
  const defaults: TextStyle = {
    font: def.font ?? "",
    tint: def.tint ?? palette.default ?? 0,
    align: def.align ?? TextAlign.Left,
  };

  const styles: Record<string, TextStyle> = {};
  if (def.styles) {
    for (const [name, s] of Object.entries(def.styles)) {
      styles[name] = {
        font: s.font ?? defaults.font,
        tint: s.tint ?? defaults.tint,
        align: s.align ?? defaults.align,
      };
    }
  }

  return { default: defaults, styles };
}
