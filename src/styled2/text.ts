import { themeBinding, type StyleResolver, type ThemeColor } from "../theme2";
import { TextAlign } from "../util/align";
import { Component, type ComponentConfig } from "../core2/component";
import { BitmapText } from "../core2/bitmap-text";

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

const TextStyleResolver = {
  font: (_ctx, raw, def) => raw ?? def,
  tint: (ctx, raw, def) => ctx.palette.resolve(raw ?? def),
  align: (_ctx, raw, def) => raw ?? def ?? TextAlign.Left,
} satisfies StyleResolver<TextStyle>;

export class Text extends BitmapText {
  static readonly binding = themeBinding<TextStyle>()("text", TextStyleResolver);

  constructor(parent: Component, cfg: TextConfig) {
    const theme = parent.mount.theme;
    const s = theme.resolve(Text, cfg.style);

    super(parent, { font: s.font, tint: s.tint, ...cfg });
  }
}
