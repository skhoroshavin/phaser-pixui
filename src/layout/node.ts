import { Axis } from "./axis";
import { type Layout } from "./layout";
import type { Size } from "../shared/size.ts";
import type { Rect } from "../shared/rect";

export type IntrinsicSize = Partial<Size> | IntrinsicSizeFn;
type IntrinsicSizeFn = (availableWidth?: number) => Size;

/** Layout tree {@link Node} configuration. */
export interface NodeConfig {
  /** {@link Layout} properties of this node. */
  layout?: Layout;
  /**
   * Natural size of this node, used when the layout doesn't assign an explicit
   * one. Can be a function of available width, for example, to measure text.
   */
  intrinsicSize?: IntrinsicSize;
  /**
   * Called when layout is resolved for this node.
   */
  onLayout?: (rect: Rect, depth: number) => void;
}

/**
 * A node of the layout tree. Holds layout properties and resolved geometry,
 * has zero external dependencies.
 */
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
    this._contentRect = { x: 0, y: 0, width: 0, height: 0 };
    this._availableRect = { x: 0, y: 0, width: 0, height: 0 };
    this.depth = 0;
  }

  // inputs (externally-set)
  /** Layout properties of this node. */
  readonly layout: Layout;
  /** Child nodes, in flow order. */
  readonly children: Node[] = [];
  /** Called with the resolved rect and depth when this node's geometry is assigned. */
  onLayout?: (rect: Rect, depth: number) => void;
  private _intrinsicSize: Size | IntrinsicSizeFn;

  // derived from inputs (per-axis positional geometry)
  readonly xAxis: Axis;
  readonly yAxis: Axis;

  // intermediate (engine-written during resolve)
  measured: {
    topDownWidth?: number; // seedWidths: write, measureBottomUp: read, measureTopDown: update, measureBottomUp: read, finalizeSize: read
    bottomUpSize: Size; // measureBottomUp: write, measureTopDown: read, measureBottomUp: update, finalizeSize: read
    finalSize: Size; // finalizeSize: write, place: read
  };

  // outputs (engine-written as the output of resolve)
  private _rect: Rect;
  private _contentRect: Rect;
  private _availableRect: Rect;
  depth: number;

  /** Resolved rect of this node. */
  get rect(): Rect {
    return this._rect;
  }

  /** Resolved content rect: the rect shrunk by padding. */
  get contentRect(): Rect {
    return this._contentRect;
  }

  /** Resolved maximal potentially available space for this node within its parent. */
  get availableRect(): Rect {
    return this._availableRect;
  }

  /** Assigns geometry to this node and fires {@link Node.onLayout}. */
  setRect(rect: Rect, availableRect: Rect = rect): void {
    this._rect = rect;
    this._availableRect = availableRect;
    this._contentRect = {
      x: this.xAxis.contentStart(this._rect.x),
      y: this.yAxis.contentStart(this._rect.y),
      width: this.xAxis.contentSize(this._rect.width),
      height: this.yAxis.contentSize(this._rect.height),
    };
    this.onLayout?.(rect, this.depth);
  }

  /** Adds child nodes. */
  add(...children: Node[]): this {
    this.children.push(...children);
    return this;
  }

  /** Removes a child node. */
  remove(child: Node): void {
    const i = this.children.indexOf(child);
    if (i >= 0) this.children.splice(i, 1);
  }

  /** Returns natural size of this node, given available width. */
  intrinsicSize(availableWidth?: number): Size {
    const i = this._intrinsicSize;
    if (typeof i === "function") {
      const r = i(availableWidth);
      return { width: r.width ?? 0, height: r.height ?? 0 };
    }
    return i;
  }

  /** Sets natural size of this node. */
  setIntrinsicSize(value: IntrinsicSize): void {
    this._intrinsicSize = Node.normalizeIntrinsic(value);
  }

  /** Whether this node is positioned absolutely (taken out of flow). */
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
