export function createBox({ margin, marginX, marginY, inset, ...box }: BoxConfig = {}): BoxConfig {
  return {
    ...box,
    marginLeft: box.marginLeft ?? marginX ?? margin,
    marginRight: box.marginRight ?? marginX ?? margin,
    marginTop: box.marginTop ?? marginY ?? margin,
    marginBottom: box.marginBottom ?? marginY ?? margin,
    left: box.left ?? inset,
    top: box.top ?? inset,
    right: box.right ?? inset,
    bottom: box.bottom ?? inset,
  };
}

export type BoxConfig = {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
  inset?: number;
  margin?: number | "auto";
  marginX?: number | "auto";
  marginY?: number | "auto";
  marginLeft?: number | "auto";
  marginTop?: number | "auto";
  marginRight?: number | "auto";
  marginBottom?: number | "auto";
};

export function resolveAxisX(
  containerStart: number,
  containerLength: number,
  box: BoxConfig,
  baseLength: number,
): { x: number; w: number } {
  const { pos, len } = resolveAxis(
    containerStart,
    containerLength,
    {
      start: box.left,
      end: box.right,
      length: box.width,
      marginStart: box.marginLeft,
      marginEnd: box.marginRight,
    },
    baseLength,
  );
  return { x: pos, w: len };
}

export function resolveAxisY(
  containerStart: number,
  containerLength: number,
  box: BoxConfig,
  baseLength: number,
): { y: number; h: number } {
  const { pos, len } = resolveAxis(
    containerStart,
    containerLength,
    {
      start: box.top,
      end: box.bottom,
      length: box.height,
      marginStart: box.marginTop,
      marginEnd: box.marginBottom,
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
