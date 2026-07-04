import { Component, ComponentConfig } from "../../../src/core/component";
import { Image } from "../../../src/core/image";
import { BitmapText, TextConfig } from "../../../src/core/bitmap-text";
import { colors, fonts } from "./constants.ts";

export type FrameConfig = ComponentConfig & {
  frame: string;
};

export function frame(parent: Component, cfg: FrameConfig) {
  return new Image(parent, { texture: parent.mount.atlas, tileX: true, tileY: true, ...cfg });
}

export function text(parent: Component, cfg: Partial<TextConfig>) {
  return new BitmapText(parent, { font: fonts.roots, tint: colors.light, ...cfg });
}
