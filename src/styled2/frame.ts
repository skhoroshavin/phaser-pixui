import type { BoxConfig } from "../layout";
import { themeBinding, type StyleResolver, type ResolvedStyle } from "../theme2";
import { Component } from "../core2/component";
import { Image } from "../core2/image";

export type FrameConfig = BoxConfig & {
  style?: string | FrameStyle;
};

export type FrameStyle = {
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
};

export const FrameStyleResolver = {
  frame: (_ctx, raw, def) => raw ?? def,
  tileX: (_ctx, raw, def) => raw ?? def ?? false,
  tileY: (_ctx, raw, def) => raw ?? def ?? false,
} satisfies StyleResolver<FrameStyle>;

export type ResolvedFrameStyle = ResolvedStyle<FrameStyle, typeof FrameStyleResolver>;

export class Frame extends Image {
  static readonly binding = themeBinding<FrameStyle>()("frame", FrameStyleResolver);

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
