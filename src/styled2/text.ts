import {
  ResolvedComponentTheme,
  ResolvedPalette,
  type ComponentTheme,
  type ThemeColor,
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
  font?: string;
  tint?: ThemeColor;
  align?: TextAlign;
};

export type TextTheme = ComponentTheme<TextStyle>;

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

export class ResolvedTextTheme extends ResolvedComponentTheme<ResolvedTextStyle> {
  constructor(def: TextTheme, palette: ResolvedPalette) {
    super();
    this._default = {
      font: def.font ?? "",
      tint: palette.resolve(def.tint),
      align: def.align ?? TextAlign.Left,
    };
    this._styles = {};
    if (def.styles) {
      for (const [name, s] of Object.entries(def.styles)) {
        this._styles[name] = {
          font: s.font ?? this._default.font,
          tint: palette.resolve(s.tint ?? def.tint),
          align: s.align ?? this._default.align,
        };
      }
    }
  }
}
