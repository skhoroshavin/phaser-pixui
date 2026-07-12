import { Axis } from "./axis";
import { type Layout } from "./layout";
import type { Size } from "../shared/size.ts";
import type { Rect } from "../shared/rect";

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
      l.paddingLeft ?? l.paddingX ?? l.padding ?? 0,
      l.paddingRight ?? l.paddingX ?? l.padding ?? 0,
      l.marginLeft ?? l.marginX ?? l.margin ?? 0,
      l.marginRight ?? l.marginX ?? l.margin ?? 0,
    );
    this.yAxis = Node.deriveAxis(
      l.top ?? l.insetY ?? l.inset,
      l.bottom ?? l.insetY ?? l.inset,
      l.paddingTop ?? l.paddingY ?? l.padding ?? 0,
      l.paddingBottom ?? l.paddingY ?? l.padding ?? 0,
      l.marginTop ?? l.marginY ?? l.margin ?? 0,
      l.marginBottom ?? l.marginY ?? l.margin ?? 0,
    );
    this.measured = {
      topDownWidth: undefined,
      bottomUpSize: { width: 0, height: 0 },
      finalSize: { width: 0, height: 0 },
    };
    this._rect = { x: 0, y: 0, width: 0, height: 0 };
    this.depth = 0;
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
    this._rect = rect;
    this.onLayout?.(rect, this.depth);
  }

  add(...children: Node[]): this {
    this.children.push(...children);
    return this;
  }

  remove(child: Node): void {
    const i = this.children.indexOf(child);
    if (i >= 0) this.children.splice(i, 1);
  }

  intrinsicSize(availableWidth?: number): Size {
    const i = this._intrinsicSize;
    if (typeof i === "function") {
      const r = i(availableWidth);
      return { width: r.width ?? 0, height: r.height ?? 0 };
    }
    return i;
  }

  setIntrinsicSize(value: IntrinsicSize): void {
    this._intrinsicSize = Node.normalizeIntrinsic(value);
  }

  isAbsolute(): boolean {
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
    if (value === undefined) return { width: 0, height: 0 };
    if (typeof value === "function") return value;
    return { width: value.width ?? 0, height: value.height ?? 0 };
  }

  private static deriveAxis(
    start: number | undefined,
    end: number | undefined,
    padStart: number,
    padEnd: number,
    mStart: number | "auto",
    mEnd: number | "auto",
  ): Axis {
    return new Axis(
      start,
      end,
      padStart,
      padEnd,
      mStart === "auto" ? 0 : mStart,
      mEnd === "auto" ? 0 : mEnd,
      mStart === "auto",
      mEnd === "auto",
    );
  }
}
