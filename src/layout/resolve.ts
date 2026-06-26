import { resolveAxisX, resolveAxisY } from "./layout";
import { type Node, type Rect } from "./node";

export function resolve(root: Node): void {
  resolveNode(root, undefined);
}

function resolveNode(node: Node, parentRect: Rect | undefined): void {
  const baseW = node.layout.width ?? node.intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? node.intrinsic?.h ?? 0;

  if (parentRect === undefined) {
    updateNode(node, { x: 0, y: 0, w: baseW, h: baseH });
    return;
  }

  const { x, w } = resolveAxisX(parentRect.x, parentRect.w, node.layout, baseW);
  const { y, h } = resolveAxisY(parentRect.y, parentRect.h, node.layout, baseH);

  updateNode(node, { x, y, w, h });
}

function updateNode(node: Node, rect: Rect): void {
  if (
    rect.x !== node.rect.x ||
    rect.y !== node.rect.y ||
    rect.w !== node.rect.w ||
    rect.h !== node.rect.h
  ) {
    node.rect = rect;
    node.onLayout?.(node.rect);
  }
  for (const child of node.children) {
    resolveNode(child, node.rect);
  }
}
