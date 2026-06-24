import type { ThemeContext } from "./context";

export type StyleMap<T> = T & { styles?: Record<string, Partial<T>> };

// A StyleResolver maps each field of a style T to a rule:
//   (ctx, raw, def, self) => resolved value
//   ctx - theme context (palette, etc.)
//   raw - value from the incoming style variant (T[K] | undefined)
//   def - already-resolved default for this field (NonNullable<T[K]>)
//   self - whole incoming style variant object (for cross-field fallbacks)
export type StyleResolver<T> = {
  [K in keyof T]: (
    ctx: ThemeContext,
    raw: T[K] | undefined,
    def: NonNullable<T[K]>,
    self: Partial<T>,
  ) => unknown;
};

// Build a single resolved style from raw partial input + a resolved default.
export function resolveStyle<T, R extends StyleResolver<T>>(
  ctx: ThemeContext,
  raw: Partial<T>,
  def: ResolvedStyle<T, R>,
  resolver: R,
): ResolvedStyle<T, R> {
  const out: Record<string, unknown> = {};
  for (const key in resolver) {
    const resolve = (resolver as Record<string, FieldResolver>)[key]!;
    out[key] = resolve(
      ctx,
      (raw as Record<string, unknown>)[key],
      (def as Record<string, unknown>)[key],
      raw,
    );
  }
  return out as ResolvedStyle<T, R>;
}

export type ResolvedStyle<T, R extends StyleResolver<T>> = {
  [K in keyof R]: R[K] extends (...args: infer _) => infer Ret ? Ret : never;
};

type FieldResolver = (ctx: ThemeContext, raw: unknown, def: unknown, self: unknown) => unknown;
