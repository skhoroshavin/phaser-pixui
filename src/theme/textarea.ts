import { TextAlign } from "../util/align.ts";
import { FontStyle, initFontStyle } from "./font.ts";
import type { StyleList, ThemeConfig } from "./theme.ts";

export type TextAreaStyle = {
  defaultAlign?: TextAlign;
} & FontStyle;

export function initTextAreaStyle(base: StyleList<TextAreaStyle>, theme: ThemeConfig) {
  initFontStyle(base, theme);

  if (!base.styles) return;
  for (const style of Object.values(base.styles)) {
    initFontStyle(style, base);
  }
}
