import { FrameStyle, initFrameStyle } from "./frame.ts";
import type { StyleList } from "./theme.ts";

export type DialogStyle = FrameStyle & {
  backdropColor?: number;
  backdropAlpha?: number;
};

export function initDialogStyle(base: StyleList<DialogStyle>) {
  initFrameStyle("dialog", base);

  base.backdropColor ??= 0x000000;
  base.backdropAlpha ??= 0.5;

  if (!base.styles) return;
  for (const style of Object.values(base.styles)) {
    style.backdropColor ??= base.backdropColor;
    style.backdropAlpha ??= base.backdropAlpha;
  }
}
