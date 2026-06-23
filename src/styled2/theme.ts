import { resolveTextTheme, type TextTheme, type ResolvedTextTheme } from "./text.js";
import { resolveFrameTheme, type FrameTheme, type ResolvedFrameTheme } from "./frame.js";

export type { FrameStyle, ResolvedFrameStyle, FrameTheme, ResolvedFrameTheme } from "./frame.js";
export { resolveFrameTheme } from "./frame.js";
export type { TextStyle, ResolvedTextStyle, TextTheme, ResolvedTextTheme } from "./text.js";

export type ThemeColor = string | number;

export type ComponentTheme<T> = T & {
  styles?: Record<string, T>;
};

export type ResolvedComponentTheme<T> = {
  default: T;
  styles: Record<string, T>;
};

export type ThemeResources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};

export type Palette = Record<string, ThemeColor>;
export type ResolvedPalette = Record<string, number>;

export type ThemeDefinition = {
  resources: ThemeResources;
  palette: Palette;
  text: TextTheme;
  frame: FrameTheme;
};

export type ResolvedTheme = {
  resources: ThemeResources;
  palette: ResolvedPalette;
  text: ResolvedTextTheme;
  frame: ResolvedFrameTheme;
};

export function resolveTheme(theme: ThemeDefinition): ResolvedTheme {
  const palette = resolvePalette(theme.palette);
  const text = resolveTextTheme(theme.text, palette);
  const frame = resolveFrameTheme(theme.frame);

  return {
    resources: theme.resources,
    palette,
    text,
    frame,
  };
}

function resolvePalette(p: Palette): ResolvedPalette {
  const result: ResolvedPalette = {};
  for (const [key, value] of Object.entries(p)) {
    if (typeof value === "number") {
      result[key] = value;
    } else if (value in p) {
      const ref = p[value];
      result[key] = typeof ref === "number" ? ref : 0;
    } else {
      result[key] = 0;
    }
  }
  return result;
}
