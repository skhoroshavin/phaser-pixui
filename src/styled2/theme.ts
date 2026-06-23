import { ResolvedTextTheme, type TextTheme } from "./text.js";
import { ResolvedFrameTheme, type FrameTheme } from "./frame.js";
import { ResolvedPalette, type Palette } from "./theme-utils.js";

export type ThemeResources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};

export type ThemeDefinition = {
  resources: ThemeResources;
  palette: Palette;
  text: TextTheme;
  frame: FrameTheme;
};

export class ResolvedTheme {
  readonly resources: ThemeResources;
  readonly palette: ResolvedPalette;
  readonly text: ResolvedTextTheme;
  readonly frame: ResolvedFrameTheme;

  constructor(def: ThemeDefinition) {
    this.resources = def.resources;
    this.palette = new ResolvedPalette(def.palette);
    this.text = new ResolvedTextTheme(def.text, this.palette);
    this.frame = new ResolvedFrameTheme(def.frame);
  }
}
