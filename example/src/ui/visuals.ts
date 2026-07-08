import { Component, type ComponentConfig } from "../../../src/components/component";
import { Image } from "../../../src/components/image";
import { Text, type TextConfig } from "../../../src/components/text";
import { colors, fonts, uiTexture } from "./constants.ts";

export type FrameConfig = ComponentConfig & { frame?: string };

export function frame(parent: Component, cfg: FrameConfig = {}) {
  return parent.add(Image, {
    texture: uiTexture,
    frame: "frame",
    tileX: true,
    tileY: true,
    paddingX: 9,
    paddingY: 8,
    ...cfg,
  });
}

export function text(parent: Component, cfg: Partial<TextConfig>) {
  return parent.add(Text, { font: fonts.pypx, tint: colors.dark, ...cfg });
}
