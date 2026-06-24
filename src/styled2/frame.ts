import type { BoxConfig } from "../layout";
import { StyleRegistry, type Variants, inherit, fallback } from "./theme-utils.js";
import { Component } from "../core2/component.js";
import { Image } from "../core2/image.js";

export type FrameConfig = BoxConfig & {
  style?: string;
};

export type FrameStyle = {
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
};

export type FrameThemeConfig = Variants<FrameStyle>;

export class Frame extends Image {
  constructor(parent: Component, cfg: FrameConfig) {
    const theme = parent.mount.theme;
    const s = theme.frame.resolve(cfg.style);

    super(parent, {
      texture: theme.resources.atlas,
      frame: s.frame,
      tileX: s.tileX,
      tileY: s.tileY,
      ...cfg,
    });
  }
}

export type ResolvedFrameStyle = {
  frame: string;
  tileX: boolean;
  tileY: boolean;
};

export class FrameTheme extends StyleRegistry<ResolvedFrameStyle> {
  static readonly key = "frame";
  constructor(cfg: FrameThemeConfig) {
    super(cfg, {
      frame: inherit(),
      tileX: fallback(false),
      tileY: fallback(false),
    });
  }
}
