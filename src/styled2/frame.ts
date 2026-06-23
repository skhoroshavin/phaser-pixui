import type { BoxConfig } from "../layout";
import { ResolvedComponentTheme, type ComponentTheme } from "./theme-utils.js";
import { Component } from "../core2/component.js";
import { Image } from "../core2/image.js";

export type FrameConfig = BoxConfig & {
  style?: string;
};

export type FrameStyle = {
  frame?: string;
  tileX?: boolean;
  tileY?: boolean;
};

export type FrameTheme = ComponentTheme<FrameStyle>;

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

export class ResolvedFrameTheme extends ResolvedComponentTheme<ResolvedFrameStyle> {
  constructor(def: FrameTheme) {
    super();
    this._default = {
      frame: def.frame ?? "",
      tileX: def.tileX ?? false,
      tileY: def.tileY ?? false,
    };
    this._styles = {};
    if (def.styles) {
      for (const [name, s] of Object.entries(def.styles)) {
        this._styles[name] = {
          frame: s.frame ?? this._default.frame,
          tileX: s.tileX ?? this._default.tileX,
          tileY: s.tileY ?? this._default.tileY,
        };
      }
    }
  }
}
