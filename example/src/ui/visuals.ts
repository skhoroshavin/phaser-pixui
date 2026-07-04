import { Component, ComponentConfig } from "../../../src/core/component";
import { Image } from "../../../src/core/image";
import { Text, TextConfig } from "../../../src/core/text";
import { colors, fonts, resources } from "./constants.ts";

export type FrameConfig = ComponentConfig & {
  frame: string;
};

export function frame(parent: Component, cfg: FrameConfig) {
  return new Image(parent, { texture: resources.atlas, tileX: true, tileY: true, ...cfg });
}

export function text(parent: Component, cfg: Partial<TextConfig>) {
  return new Text(parent, { font: fonts.roots, tint: colors.light, ...cfg });
}
