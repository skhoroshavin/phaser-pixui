import type { ThemeContext, ThemeResources } from "./context.ts";
import type { PaletteConfig } from "./palette.ts";

export type StyleMap<T> = T & { styles?: Record<string, Partial<T>> };

export interface ThemedComponent {
  readonly styleKey: string;
  resolveStyle(ctx: ThemeContext, raw: unknown, def: unknown): unknown;
}

export function defineTheme<R extends readonly ThemedComponent[]>(
  components: R,
  data: ThemeData<R>,
): ThemeConfig<R> {
  return { ...data, components };
}

export type ThemeConfig<R extends readonly ThemedComponent[] = readonly ThemedComponent[]> =
  ThemeData<R> & { readonly components: R };

type ThemeData<R extends readonly ThemedComponent[]> = {
  resources: ThemeResources;
  palette: PaletteConfig;
} & {
  [K in R[number] as K["styleKey"]]: StyleMap<Parameters<K["resolveStyle"]>[2]>;
};
