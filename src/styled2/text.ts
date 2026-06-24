import {
  StyleRegistry,
  Palette,
  type Variants,
  type ThemeColor,
  inherit,
  color,
} from "./theme-utils.js";
import { TextAlign } from "../util/align.js";
import { Component } from "../core2/component.js";
import { BitmapText } from "../core2/bitmap-text.js";
import type { BoxConfig } from "../layout";

export type TextConfig = BoxConfig & {
  style?: string;
  text?: string;
  tint?: number;
};

export type TextStyle = {
  font: string;
  tint?: ThemeColor;
  align?: TextAlign;
};

export type TextThemeConfig = Variants<TextStyle>;

export class Text extends BitmapText {
  constructor(parent: Component, cfg: TextConfig) {
    const theme = parent.mount.theme;
    const s = theme.text.resolve(cfg.style);

    super(parent, { font: s.font, tint: s.tint, ...cfg });
  }
}

export type ResolvedTextStyle = {
  font: string;
  tint: number;
  align: TextAlign;
};

export class TextTheme extends StyleRegistry<ResolvedTextStyle> {
  static readonly key = "text";
  constructor(cfg: TextThemeConfig, palette: Palette) {
    super(cfg, {
      font: inherit(),
      tint: color(palette),
      align: (raw, def) => raw ?? def ?? TextAlign.Left,
    });
  }
}
