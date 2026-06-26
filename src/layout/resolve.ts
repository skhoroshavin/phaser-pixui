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

function measureNode(_node: Node, _parentRect: Rect | undefined): Size {
  if (_node.layout.direction !== undefined && _node.children.length > 0) {
    return measureFlex(_node);
  }
  return measureBox(_node);
}

function measureBox(node: Node): Size {
  const baseW = node.layout.width ?? node.intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? node.intrinsic?.h ?? 0;

  if (node.children.length > 0) {
    let maxW = 0;
    let maxH = 0;
    for (const child of node.children) {
      const cs = measureNode(child, undefined);
      maxW = Math.max(maxW, (child.layout.left ?? 0) + cs.w);
      maxH = Math.max(maxH, (child.layout.top ?? 0) + cs.h);
    }
    return {
      w: node.layout.width !== undefined ? baseW : maxW,
      h: node.layout.height !== undefined ? baseH : maxH,
    };
  }

  return { w: baseW, h: baseH };
}

function measureFlex(node: Node): Size {
  const isColumn = node.layout.direction === "column";
  const gap = node.layout.gap ?? 0;
  let mainTotal = 0;
  let crossMax = 0;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]!;
    if (i > 0) mainTotal += gap;
    const cs = measureNode(child, undefined);
    mainTotal += isColumn ? cs.h : cs.w;
    crossMax = Math.max(crossMax, isColumn ? cs.w : cs.h);
  }

  const baseW = node.layout.width ?? node.intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? node.intrinsic?.h ?? 0;
  if (isColumn) {
    return {
      w: node.layout.width === undefined && node.intrinsic?.w === undefined ? crossMax : baseW,
      h: node.layout.height === undefined && node.intrinsic?.h === undefined ? mainTotal : baseH,
    };
  }
  return {
    w: node.layout.width === undefined && node.intrinsic?.w === undefined ? mainTotal : baseW,
    h: node.layout.height === undefined && node.intrinsic?.h === undefined ? crossMax : baseH,
  };
}

function placeFlex(container: Node, direction: "row" | "column"): void {
  let pos = direction === "column" ? container.rect.y : container.rect.x;
  const gap = container.layout.gap ?? 0;
  for (const child of container.children) {
    const cs = measureNode(child, undefined);
    const childRect =
      direction === "column"
        ? { x: container.rect.x, y: pos, w: cs.w, h: cs.h }
        : { x: pos, y: container.rect.y, w: cs.w, h: cs.h };
    setNodeRect(child, childRect);
    for (const grandchild of child.children) {
      resolveNode(grandchild, child.rect);
    }
    pos += (direction === "column" ? cs.h : cs.w) + gap;
  }
}
