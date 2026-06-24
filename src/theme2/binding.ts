import type { StyleResolver } from "./style.ts";

export function themeBinding<T>() {
  return <K extends string, R extends StyleResolver<T>>(
    key: K,
    resolver: R,
  ): ThemeBinding<K, T, R> => ({ key, resolver });
}

export interface ThemeBinding<K extends string, T, R extends StyleResolver<T>> {
  readonly key: K;
  readonly resolver: R;
}

export type ThemeBindingBase = ThemeBinding<string, unknown, StyleResolver<unknown>>;

export type ThemedComponent = { readonly binding: ThemeBindingBase };
