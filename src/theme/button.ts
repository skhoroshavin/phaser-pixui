import { Textures } from "phaser";
import { Shape } from "../core/interactive.ts";
import { frameDimensions } from "../util/frame.ts";
import { FontStyle, initFontStyle } from "./font.ts";
import type { StyleList, ThemeConfig } from "./theme.ts";

type Texture = Textures.Texture;

export type ButtonStyle = {
  frame?: string;
  frameUp?: string;
  frameDown?: string;
  frameHover?: string;
  frameDisabled?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  shape?: Shape;
  tileX?: boolean;
  tileY?: boolean;
  fontTintDisabled?: string;
} & FontStyle;

export function initButtonStyle(base: StyleList<ButtonStyle>, theme: ThemeConfig, atlas: Texture) {
  initAtlasFrames(base, atlas);
  if (base.frameUp === undefined) console.error(`Base button doesn't have frameUp defined`);
  if (base.frameDown === undefined) console.error(`Base button doesn't have frameDown defined`);
  base.frameHover ??= base.frameUp;
  base.frameDisabled ??= base.frameUp;
  base.shape ??= "rect";
  base.tileX ??= false;
  base.tileY ??= false;
  initFontStyle(base, theme);
  base.fontTintDisabled ??= base.fontTint;

  if (!base.styles) return;
  for (const style of Object.values(base.styles)) {
    style.frame ??= base.frame;
    initAtlasFrames(style, atlas);

    style.frameUp ??= base.frameUp;
    style.frameDown ??= base.frameDown;
    style.frameHover ??= base.frameHover;
    style.frameDisabled ??= base.frameDisabled;
    style.shape ??= base.shape;
    style.tileX ??= base.tileX;
    style.tileY ??= base.tileY;
    style.defaultWidth ??= base.defaultWidth;
    style.defaultHeight ??= base.defaultHeight;
    style.fontTintDisabled ??= base.fontTintDisabled;
    initFontStyle(style, base);
  }
}

function initAtlasFrames(style: ButtonStyle, atlas: Texture) {
  if (!style.frame) return;

  const frameName = (name: string) => (atlas.has(name) ? name : undefined);
  style.frameUp ??= frameName(`${style.frame}_up`);
  style.frameDown ??= frameName(`${style.frame}_down`);
  style.frameHover ??= frameName(`${style.frame}_hover`);
  style.frameDisabled ??= frameName(`${style.frame}_disabled`);

  const frame = frameDimensions(atlas.get(style.frameUp));
  if (!frame.scalableX) style.defaultWidth ??= frame.width;
  if (!frame.scalableY) style.defaultHeight ??= frame.height;
}
