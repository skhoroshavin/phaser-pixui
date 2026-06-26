import { resolveAxisX, resolveAxisY } from "./layout";
import { type Node, type Rect } from "./node";

export function resolve(root: Node): void {
  resolveNode(root, undefined);
}

function resolveNode(node: Node, parentRect: Rect | undefined): void {
  const baseW = node.layout.width ?? node.intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? node.intrinsic?.h ?? 0;

  if (parentRect === undefined) {
    setNodeRect(node, { x: 0, y: 0, w: baseW, h: baseH });
    placeChildren(node);
    return;
  }

  const { x, w } = resolveAxisX(parentRect.x, parentRect.w, node.layout, baseW);
  const { y, h } = resolveAxisY(parentRect.y, parentRect.h, node.layout, baseH);

  setNodeRect(node, { x, y, w, h });
  placeChildren(node);
}

function setNodeRect(node: Node, rect: Rect): void {
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

function placeChildren(node: Node): void {
  if (node.layout.direction === "column") {
    placeFlex(node, "column");
  } else if (node.layout.direction === "row") {
    placeFlex(node, "row");
  } else {
    for (const child of node.children) {
      resolveNode(child, node.rect);
    }
  }
}

function placeFlex(container: Node, direction: "row" | "column"): void {
  let pos = direction === "column" ? container.rect.y : container.rect.x;
  for (const child of container.children) {
    const baseW = child.layout.width ?? child.intrinsic?.w ?? 0;
    const baseH = child.layout.height ?? child.intrinsic?.h ?? 0;
    const childRect =
      direction === "column"
        ? { x: container.rect.x, y: pos, w: baseW, h: baseH }
        : { x: pos, y: container.rect.y, w: baseW, h: baseH };
    setNodeRect(child, childRect);
    for (const grandchild of child.children) {
      resolveNode(grandchild, child.rect);
    }
    pos += direction === "column" ? baseH : baseW;
  }
}
