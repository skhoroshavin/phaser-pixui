import type { ComponentTheme, ResolvedComponentTheme } from "./theme.js";

export type FrameStyle = {
  frame: string;
  tileX: boolean;
  tileY: boolean;
};

export type FrameTheme = ComponentTheme<FrameStyle>;
export type ResolvedFrameTheme = ResolvedComponentTheme<FrameStyle>;

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
