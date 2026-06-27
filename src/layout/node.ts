import { createLayout, type Layout } from "./layout";

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };

export interface Node {
  // inputs (externally-set)
  layout: Layout;
  children: Node[];
  intrinsic?: Partial<Size> | ((availableWidth?: number) => Size);
  // outputs (engine-written)
  rect: Rect;
  depth: number;
  // callbacks (engine-fired)
  onLayout?: (rect: Rect, depth: number) => void;
}

export function createNode(node: Partial<Omit<Node, "rect">>): Node {
  return {
    layout: createLayout(node.layout),
    children: node.children ?? [],
    intrinsic: node.intrinsic,
    rect: { x: NaN, y: NaN, w: NaN, h: NaN },
    depth: NaN,
    onLayout: node.onLayout,
  };
}
