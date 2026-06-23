import { resolveAxisX, resolveAxisY } from "./box";
import { type Node, type Rect } from "./node";

export function resolve(root: Node): void {
  resolveNode(root, undefined);
}

function resolveNode(node: Node, parentRect: Rect | undefined): void {
  const { box } = node;
  const baseW = node.box.width ?? node.intrinsic?.w ?? 0;
  const baseH = node.box.height ?? node.intrinsic?.h ?? 0;

  if (parentRect === undefined) {
    updateNode(node, { x: 0, y: 0, w: baseW, h: baseH });
    return;
  }

  const { x, w } = resolveAxisX(parentRect.x, parentRect.w, box, baseW);
  const { y, h } = resolveAxisY(parentRect.y, parentRect.h, box, baseH);

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
