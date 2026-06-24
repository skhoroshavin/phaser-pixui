import type { BoxConfig } from "../layout";
import { StyleRegistry, type Variants } from "./theme-utils.js";
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
  constructor(cfg: FrameThemeConfig) {
    super();
    this._default = {
      frame: cfg.frame,
      tileX: cfg.tileX ?? false,
      tileY: cfg.tileY ?? false,
    };
    this._styles = {};
    if (cfg.styles) {
      for (const [name, s] of Object.entries(cfg.styles)) {
        this._styles[name] = {
          frame: s.frame ?? this._default.frame,
          tileX: s.tileX ?? this._default.tileX,
          tileY: s.tileY ?? this._default.tileY,
        };
      }
    }
  }
}
