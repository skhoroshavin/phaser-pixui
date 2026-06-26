import { Palette } from "./palette";

export interface ThemeContext {
  palette: Palette;
}

export type ThemeResources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};
