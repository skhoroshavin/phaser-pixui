import { TextAlign } from "../util/align.js";
import { Component } from "../core2/component.js";
import { BitmapText } from "../core2/bitmap-text.js";
import type { BoxConfig } from "../layout/node.js";
import type {
  ComponentTheme,
  ResolvedComponentTheme,
  ThemeColor,
  ResolvedPalette,
} from "./theme.js";

export type TextStyle = {
  font?: string;
  tint?: ThemeColor;
  align?: TextAlign;
};

export type ResolvedTextStyle = {
  font: string;
  tint: number;
  align: TextAlign;
};

export type TextTheme = ComponentTheme<TextStyle>;
export type ResolvedTextTheme = ResolvedComponentTheme<ResolvedTextStyle>;

function resolveColor(color: ThemeColor | undefined, palette: ResolvedPalette): number {
  if (color === undefined) return palette.default ?? 0;
  if (typeof color === "number") return color;
  if (color in palette) return palette[color]!;
  return palette.default ?? 0;
}

export type TextConfig = BoxConfig & {
  style?: string;
  text?: string;
  tint?: number;
};

export class Text extends BitmapText {
  constructor(parent: Component, cfg: TextConfig) {
    const theme = parent.mount.theme;
    const s = cfg.style ? (theme.text.styles[cfg.style] ?? theme.text.default) : theme.text.default;

    super(parent, { font: s.font, tint: s.tint, ...cfg });
  }
}

export function resolveTextTheme(def: TextTheme, palette: ResolvedPalette): ResolvedTextTheme {
  const resolvedDefault: ResolvedTextStyle = {
    font: def.font ?? "",
    tint: resolveColor(def.tint, palette),
    align: def.align ?? TextAlign.Left,
  };

  const resolvedStyles: Record<string, ResolvedTextStyle> = {};
  if (def.styles) {
    for (const [name, s] of Object.entries(def.styles)) {
      resolvedStyles[name] = {
        font: s.font ?? resolvedDefault.font,
        tint: resolveColor(s.tint ?? def.tint, palette),
        align: s.align ?? resolvedDefault.align,
      };
    }
  }

  return { default: resolvedDefault, styles: resolvedStyles };
}
