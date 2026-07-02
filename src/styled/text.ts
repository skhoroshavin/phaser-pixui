import { type ThemeColor, type ThemeContext } from "../theme";
import { Component, type ComponentConfig } from "../core/component";
import { BitmapText, type TextAlign } from "../core/bitmap-text";

export type TextConfig = ComponentConfig & {
  style?: string;
  text?: string;
  tint?: number;
};

export type TextStyle = {
  font: string;
  tint?: ThemeColor;
  align?: TextAlign;
};

export type ResolvedTextStyle = {
  font: string;
  tint: number;
  align: TextAlign;
};

export class Text extends BitmapText {
  static readonly styleKey = "text" as const;

  static resolveStyle(
    ctx: ThemeContext,
    raw: Partial<TextStyle>,
    def: TextStyle,
  ): ResolvedTextStyle {
    return {
      font: raw.font ?? def.font,
      tint: ctx.palette.resolve(raw.tint ?? def.tint),
      align: raw.align ?? def.align ?? "left",
    };
  }

  constructor(parent: Component, cfg: TextConfig) {
    const theme = parent.mount.theme;
    const s = theme.resolve(Text, cfg.style);

    super(parent, { font: s.font, tint: s.tint, align: s.align, ...cfg });
  }
}
