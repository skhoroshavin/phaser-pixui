import { type ThemeContext } from "../theme";
import { Image } from "../core/image";
import { Component, type ComponentConfig } from "../core/component";

export type FrameConfig = ComponentConfig & {
  style?: string | ResolvedFrameStyle;
};

export type FrameStyle = {
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
} & Padding;

export type ResolvedFrameStyle = {
  frame: string;
  tileX: boolean;
  tileY: boolean;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
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
      ...resolvePadding(def),
      ...resolvePadding(raw),
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
      ...resolvePadding(s),
      ...resolvePadding(cfg),
    });
  }
}

function resolvePadding(p: Padding): Padding {
  const x = p.paddingX ?? p.padding;
  const y = p.paddingY ?? p.padding;
  const left = p.paddingLeft ?? x;
  const right = p.paddingRight ?? x;
  const top = p.paddingTop ?? y;
  const bottom = p.paddingBottom ?? y;
  const out: Padding = {};
  if (left !== undefined) out.paddingLeft = left;
  if (right !== undefined) out.paddingRight = right;
  if (top !== undefined) out.paddingTop = top;
  if (bottom !== undefined) out.paddingBottom = bottom;
  return out;
}

type Padding = {
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingX?: number;
  paddingY?: number;
  padding?: number;
};
