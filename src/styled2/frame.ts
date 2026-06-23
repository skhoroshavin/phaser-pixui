import type { BoxConfig } from "../layout/node.js";
import type { ComponentTheme, ResolvedComponentTheme } from "./theme.js";
import { Component } from "../core2/component.js";
import { Image } from "../core2/image.js";

export type FrameStyle = {
  frame: string;
  tileX: boolean;
  tileY: boolean;
};

export type FrameTheme = ComponentTheme<FrameStyle>;
export type ResolvedFrameTheme = ResolvedComponentTheme<FrameStyle>;

export type FrameConfig = BoxConfig & {
  style?: string;
};

export class Frame extends Image {
  constructor(parent: Component, cfg: FrameConfig) {
    const theme = parent.mount.theme;
    const s = cfg.style
      ? (theme.frame.styles[cfg.style] ?? theme.frame.default)
      : theme.frame.default;

    super(parent, {
      texture: theme.resources.atlas,
      frame: s.frame,
      tileX: s.tileX,
      tileY: s.tileY,
      ...cfg,
    });
  }
}

export function resolveFrameTheme(def: FrameTheme): ResolvedFrameTheme {
  const defaults: FrameStyle = {
    frame: def.frame ?? "",
    tileX: def.tileX ?? false,
    tileY: def.tileY ?? false,
  };

  const styles: Record<string, FrameStyle> = {};
  if (def.styles) {
    for (const [name, s] of Object.entries(def.styles)) {
      styles[name] = {
        frame: s.frame ?? defaults.frame,
        tileX: s.tileX ?? defaults.tileX,
        tileY: s.tileY ?? defaults.tileY,
      };
    }
  }

  return { default: defaults, styles };
}
