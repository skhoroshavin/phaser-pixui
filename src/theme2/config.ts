import type { PaletteConfig } from "./palette.ts";
import type { ThemeResources } from "./context.ts";
import type { ThemeBinding, ThemedComponent } from "./binding.ts";
import { StyleMap } from "./style.ts";

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
  [K in R[number] as K["binding"]["key"]]: BindingCfg<K["binding"]>;
};

type BindingCfg<E> = E extends ThemeBinding<string, infer T, infer _R> ? StyleMap<T> : never;
