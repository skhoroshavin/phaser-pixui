export function createLayout({ margin, marginX, marginY, inset, ...rest }: Layout = {}): Layout {
  return {
    ...rest,
    marginLeft: rest.marginLeft ?? marginX ?? margin,
    marginRight: rest.marginRight ?? marginX ?? margin,
    marginTop: rest.marginTop ?? marginY ?? margin,
    marginBottom: rest.marginBottom ?? marginY ?? margin,
    left: rest.left ?? inset,
    top: rest.top ?? inset,
    right: rest.right ?? inset,
    bottom: rest.bottom ?? inset,
  };
}

export type Layout = {
  direction?: "row" | "column";
  gap?: number;
  justifyContent?: "start" | "center" | "end";
  alignItems?: "start" | "center" | "end";
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  inset?: number;
  margin?: number | "auto";
  marginX?: number | "auto";
  marginY?: number | "auto";
  marginLeft?: number | "auto";
  marginTop?: number | "auto";
  marginRight?: number | "auto";
  marginBottom?: number | "auto";
  zIndex?: number;
};

export function resolveAxisX(
  containerStart: number,
  containerLength: number,
  layout: Layout,
  baseLength: number,
): { x: number; w: number } {
  const { pos, len } = resolveAxis(
    containerStart,
    containerLength,
    {
      start: layout.left,
      end: layout.right,
      length: layout.width,
      marginStart: layout.marginLeft,
      marginEnd: layout.marginRight,
    },
    baseLength,
  );
  return { x: pos, w: len };
}

export function resolveAxisY(
  containerStart: number,
  containerLength: number,
  layout: Layout,
  baseLength: number,
): { y: number; h: number } {
  const { pos, len } = resolveAxis(
    containerStart,
    containerLength,
    {
      start: layout.top,
      end: layout.bottom,
      length: layout.height,
      marginStart: layout.marginTop,
      marginEnd: layout.marginBottom,
    },
    baseLength,
  );
  return { y: pos, h: len };
}

function resolveAxis(
  containerStart: number,
  containerLength: number,
  cfg: AxisConfig,
  baseLength: number,
): { pos: number; len: number } {
  const start = cfg.start;
  const end = cfg.end;
  const len = cfg.length ?? baseLength;

  const bothAuto = cfg.marginStart === "auto" && cfg.marginEnd === "auto";
  if (bothAuto && (start === undefined) === (end === undefined)) {
    const insetStart = start ?? 0;
    const insetEnd = end ?? 0;
    const free = containerLength - insetStart - insetEnd - len;
    const mStart = free > 0 ? splitFree(free, [1, 1])[0]! : 0;
    return { pos: containerStart + insetStart + mStart, len };
  }

  const mStart = cfg.marginStart === "auto" ? 0 : (cfg.marginStart ?? 0);
  const mEnd = cfg.marginEnd === "auto" ? 0 : (cfg.marginEnd ?? 0);

  if (start !== undefined && end !== undefined && cfg.length === undefined) {
    return {
      pos: containerStart + start + mStart,
      len: containerLength - start - end - mStart - mEnd,
    };
  }

  if (start !== undefined) {
    return { pos: containerStart + start + mStart, len };
  }

  if (end !== undefined) {
    return { pos: containerStart + containerLength - end - mEnd - len, len };
  }

  return { pos: containerStart + mStart, len };
}

type AxisConfig = {
  start?: number;
  end?: number;
  length?: number;
  marginStart?: number | "auto";
  marginEnd?: number | "auto";
};

function splitFree(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const base = weights.map((w) => Math.floor((total * w) / sum));
  const remainder = total - base.reduce((a, b) => a + b, 0);
  const fractions = weights
    .map((w, i) => ({ i, frac: (total * w) / sum - base[i]! }))
    .sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < remainder; i++) {
    const slot = fractions[i % fractions.length];
    if (slot) {
      base[slot.i] = (base[slot.i] ?? 0) + 1;
    }
  }
  return base;
}
