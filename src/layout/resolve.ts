import { resolveAxisX, resolveAxisY } from "./layout";
import { type Node, type Rect, type Size } from "./node";

export function resolve(root: Node): void {
  resolveNode(root, undefined);
}

function resolveNode(node: Node, parentRect: Rect | undefined): void {
  const measured = measureNode(node, parentRect);

  if (parentRect === undefined) {
    setNodeRect(node, { x: 0, y: 0, w: measured.w, h: measured.h });
    placeChildren(node);
    return;
  }

  const { x, w } = resolveAxisX(parentRect.x, parentRect.w, node.layout, measured.w);
  const { y, h } = resolveAxisY(parentRect.y, parentRect.h, node.layout, measured.h);

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

function measureNode(node: Node, parentRect: Rect | undefined): Size {
  const baseW = node.layout.width ?? node.intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? node.intrinsic?.h ?? 0;

  if (parentRect === undefined || node.layout.direction === undefined) {
    return { w: baseW, h: baseH };
  }

  const { main, cross } = measureFlex(node);
  if (node.layout.direction === "column") {
    return {
      w: node.layout.width === undefined && node.intrinsic?.w === undefined ? cross : baseW,
      h: node.layout.height === undefined && node.intrinsic?.h === undefined ? main : baseH,
    };
  }
  return {
    w: node.layout.width === undefined && node.intrinsic?.w === undefined ? main : baseW,
    h: node.layout.height === undefined && node.intrinsic?.h === undefined ? cross : baseH,
  };
}

function measureFlex(container: Node): { main: number; cross: number } {
  const isColumn = container.layout.direction === "column";
  const gap = container.layout.gap ?? 0;
  let mainTotal = 0;
  let crossMax = 0;
  for (let i = 0; i < container.children.length; i++) {
    const child = container.children[i]!;
    if (i > 0) mainTotal += gap;
    const baseW = child.layout.width ?? child.intrinsic?.w ?? 0;
    const baseH = child.layout.height ?? child.intrinsic?.h ?? 0;
    mainTotal += isColumn ? baseH : baseW;
    crossMax = Math.max(crossMax, isColumn ? baseW : baseH);
  }
  return { main: mainTotal, cross: crossMax };
}

function placeFlex(container: Node, direction: "row" | "column"): void {
  let pos = direction === "column" ? container.rect.y : container.rect.x;
  const gap = container.layout.gap ?? 0;
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
    pos += (direction === "column" ? baseH : baseW) + gap;
  }
}
