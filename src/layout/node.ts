export function createNode(node: Partial<Omit<Node, "rect">>): Node {
  return {
    box: node.box ?? {},
    children: node.children ?? [],
    rect: { x: NaN, y: NaN, w: NaN, h: NaN },
    intrinsic: node.intrinsic,
    onLayout: node.onLayout,
  };
}

export interface Node {
  box: BoxConfig;
  children: Node[];
  rect: Rect;
  intrinsic?: Size;
  onLayout?: (rect: Rect) => void;
}

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };

export type BoxConfig = {
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
};

export function resolve(root: Node): void {
  resolveNode(root, undefined);
}

function resolveNode(node: Node, parentRect: Rect | undefined): void {
  if (parentRect === undefined) {
    if (node.box.width !== undefined || node.box.height !== undefined) {
      setRect(node, { x: 0, y: 0, w: nodeSize(node, "w"), h: nodeSize(node, "h") });
    }
  } else {
    setRect(node, {
      x: node.box.right !== undefined ? parentRect.w - node.box.right - nodeSize(node, "w") : 0,
      y: node.box.bottom !== undefined ? parentRect.h - node.box.bottom - nodeSize(node, "h") : 0,
      w: nodeSize(node, "w"),
      h: nodeSize(node, "h"),
    });
  }

  for (const child of node.children) {
    resolveNode(child, node.rect);
  }
}

function nodeSize(node: Node, axis: "w" | "h"): number {
  const explicit = axis === "w" ? node.box.width : node.box.height;
  return explicit ?? node.intrinsic?.[axis] ?? 0;
}

function setRect(node: Node, rect: Rect): void {
  if (
    rect.x !== node.rect.x ||
    rect.y !== node.rect.y ||
    rect.w !== node.rect.w ||
    rect.h !== node.rect.h
  ) {
    node.rect = rect;
    node.onLayout?.(node.rect);
  }
}
