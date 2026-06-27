import { type ThemeContext } from "../theme2";
import { Image } from "../core2/image";
import { Component, type ComponentConfig } from "../core2/component";

export type FrameConfig = ComponentConfig & {
  style?: string | ResolvedFrameStyle;
};

export type FrameStyle = {
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
};

export type ResolvedFrameStyle = {
  frame: string;
  tileX: boolean;
  tileY: boolean;
};

export class Frame extends Image {
  static readonly styleKey = "frame" as const;
  static resolveStyle(
    _ctx: ThemeContext,
    raw: Partial<FrameStyle>,
    def: FrameStyle,
  ): ResolvedFrameStyle {
    return {
      frame: raw.frame ?? def.frame,
      tileX: raw.tileX ?? def.tileX ?? false,
      tileY: raw.tileY ?? def.tileY ?? false,
    };
  }

  constructor(parent: Component, cfg: FrameConfig) {
    const theme = parent.mount.theme;
    const s =
      cfg.style === undefined || typeof cfg.style === "string"
        ? theme.resolve(Frame, cfg.style as string | undefined)
        : cfg.style;

    super(parent, {
      texture: theme.resources.atlas,
      frame: s.frame,
      tileX: s.tileX,
      tileY: s.tileY,
      ...cfg,
    });
  }
}
