import { Axis } from "./axis";
import { type Layout } from "./layout";

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };
export type IntrinsicSize = Partial<Size> | IntrinsicSizeFn;
type IntrinsicSizeFn = (availableWidth?: number) => Size;

export interface NodeConfig {
  layout?: Layout;
  intrinsicSize?: IntrinsicSize;
  onLayout?: (rect: Rect, depth: number) => void;
}

export class Node {
  constructor(config: NodeConfig = {}) {
    const l = config.layout ?? {};
    this.layout = l;
    this._intrinsicSize = Node.normalizeIntrinsic(config.intrinsicSize);
    this.onLayout = config.onLayout;
    this.xAxis = Node.deriveAxis(
      l.left ?? l.insetX ?? l.inset,
      l.right ?? l.insetX ?? l.inset,
      l.marginLeft ?? l.marginX ?? l.margin,
      l.marginRight ?? l.marginX ?? l.margin,
    );
    this.yAxis = Node.deriveAxis(
      l.top ?? l.insetY ?? l.inset,
      l.bottom ?? l.insetY ?? l.inset,
      l.marginTop ?? l.marginY ?? l.margin,
      l.marginBottom ?? l.marginY ?? l.margin,
    );
    this.measured = {
      topDownWidth: undefined,
      bottomUpSize: { w: NaN, h: NaN },
      finalSize: { w: NaN, h: NaN },
    };
    this._rect = { x: NaN, y: NaN, w: NaN, h: NaN };
    this.depth = NaN;
  }

  // inputs (externally-set)
  readonly layout: Layout;
  readonly children: Node[] = [];
  onLayout?: (rect: Rect, depth: number) => void;
  private _intrinsicSize: Size | IntrinsicSizeFn;

  // derived from inputs (per-axis positional geometry)
  readonly xAxis: Axis;
  readonly yAxis: Axis;

  // intermediate (engine-written during resolve)
  measured: {
    topDownWidth?: number; // written by measureTopDown; read by measureBottomUp
    bottomUpSize: Size; // written by measureBottomUp; read by finalizeSize
    finalSize: Size; // written by finalizeSize; read by place
  };

  // outputs (engine-written as the output of resolve)
  private _rect: Rect;
  depth: number;

  get rect(): Rect {
    return this._rect;
  }

  setRect(rect: Rect): void {
    const r = this._rect;
    if (rect.x !== r.x || rect.y !== r.y || rect.w !== r.w || rect.h !== r.h) {
      this._rect = rect;
      this.onLayout?.(rect, this.depth);
    }
  }

  add(...children: Node[]): this {
    this.children.push(...children);
    return this;
  }

  intrinsicSize(availableWidth?: number): Size {
    const i = this._intrinsicSize;
    if (typeof i === "function") {
      const r = i(availableWidth);
      return { w: r.w ?? 0, h: r.h ?? 0 };
    }
    return i;
  }

  setIntrinsicSize(value: IntrinsicSize): void {
    this._intrinsicSize = Node.normalizeIntrinsic(value);
  }

  get isFlex(): boolean {
    return this.layout.direction !== undefined;
  }

  isAbsolute(parent?: Node): boolean {
    if (!(parent?.isFlex ?? false)) return true;
    return this.xAxis.hasEdge || this.yAxis.hasEdge;
  }

  clampWidth(w?: number): number | undefined {
    if (w === undefined) return undefined;
    if (this.layout.maxWidth === undefined) return w;
    return Math.min(w, this.layout.maxWidth);
  }

  get zIndex(): number {
    return this.layout.zIndex ?? 0;
  }

  private static normalizeIntrinsic(value?: IntrinsicSize): Size | IntrinsicSizeFn {
    if (value === undefined) return { w: 0, h: 0 };
    if (typeof value === "function") return value;
    return { w: value.w ?? 0, h: value.h ?? 0 };
  }

  private static deriveAxis(
    start?: number,
    end?: number,
    mStart?: number | "auto",
    mEnd?: number | "auto",
  ): Axis {
    return new Axis(
      start,
      end,
      mStart === undefined || mStart === "auto" ? 0 : mStart,
      mEnd === undefined || mEnd === "auto" ? 0 : mEnd,
      mStart === "auto",
      mEnd === "auto",
    );
  }
}
