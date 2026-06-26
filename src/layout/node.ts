import { createLayout, type Layout } from "./layout";

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };

export interface Node {
  layout: Layout;
  children: Node[];
  rect: Rect;
  intrinsic?: Size;
  onLayout?: (rect: Rect) => void;
}

export function createNode(node: Partial<Omit<Node, "rect">>): Node {
  return {
    layout: createLayout(node.layout),
    children: node.children ?? [],
    rect: { x: NaN, y: NaN, w: NaN, h: NaN },
    intrinsic: node.intrinsic,
    onLayout: node.onLayout,
  };
}
