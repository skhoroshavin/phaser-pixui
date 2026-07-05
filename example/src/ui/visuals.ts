import { Component, ComponentConfig } from "../../../src/components/component";
import { Image } from "../../../src/components/image";
import { Text, TextConfig } from "../../../src/components/text";
import { colors, fonts, uiTexture } from "./constants.ts";

export type FrameConfig = ComponentConfig & {
  frame: string;
};

export function frame(parent: Component, cfg: FrameConfig) {
  return new Image(parent, { texture: uiTexture, tileX: true, tileY: true, ...cfg });
}

export function text(parent: Component, cfg: Partial<TextConfig>) {
  return new Text(parent, { font: fonts.roots, tint: colors.light, ...cfg });
}
