import {
  resolveTextTheme,
  type TextStyle,
  type TextTheme,
  type ResolvedTextTheme,
} from "./text.js";
import {
  resolveFrameTheme,
  type FrameStyle,
  type FrameTheme,
  type ResolvedFrameTheme,
} from "./frame.js";

export type { FrameStyle, FrameTheme, ResolvedFrameTheme } from "./frame.js";
export { resolveFrameTheme } from "./frame.js";
export type { TextStyle, TextTheme, ResolvedTextTheme } from "./text.js";

export type StyleMap<Style> = Style & {
  styles?: Record<string, Style>;
};

export type ResolvedStyleMap<Style> = {
  default: Style;
  styles: Record<string, Style>;
};

export type ComponentTheme<T> = StyleMap<Partial<T>>;
export type ResolvedComponentTheme<T> = ResolvedStyleMap<T>;

export type ThemeResources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};

export type ThemeDefinition = {
  resources: ThemeResources;
  palette: Record<string, number>;
  text: TextTheme;
  frame: FrameTheme;
};

export type ResolvedTheme = {
  resources: ThemeResources;
  palette: Record<string, number>;
  text: ResolvedTextTheme;
  frame: ResolvedFrameTheme;
};

export function resolveTheme(theme: ThemeDefinition): ResolvedTheme {
  const text = resolveTextTheme(theme.text, theme.palette);
  const frame = resolveFrameTheme(theme.frame);

  return {
    palette: theme.palette,
    resources: theme.resources,
    text,
    frame,
  };
}
