import { createBox, type BoxConfig } from "./box";

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };

export interface Node {
  box: BoxConfig;
  children: Node[];
  rect: Rect;
  intrinsic?: Size;
  onLayout?: (rect: Rect) => void;
}

export function createNode(node: Partial<Omit<Node, "rect">>): Node {
  return {
    box: createBox(node.box),
    children: node.children ?? [],
    rect: { x: NaN, y: NaN, w: NaN, h: NaN },
    intrinsic: node.intrinsic,
    onLayout: node.onLayout,
  };
}
