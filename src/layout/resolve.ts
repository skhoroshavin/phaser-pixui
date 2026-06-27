import { resolveAxisX, resolveAxisY } from "./layout";
import { type Node, type Rect, type Size } from "./node";

export function resolve(root: Node): void {
  assignDepths(root, { next: 0 });
  resolveNode(root, undefined);
}

// Paint order: negative-z children behind, then the node itself, then non-negative children.
function assignDepths(node: Node, c: { next: number }): void {
  const z = (n: Node) => n.layout.zIndex ?? 0;
  const neg = node.children.filter((ch) => z(ch) < 0).sort((a, b) => z(a) - z(b));
  const rest = node.children.filter((ch) => z(ch) >= 0).sort((a, b) => z(a) - z(b));
  neg.forEach((ch) => assignDepths(ch, c));
  node.depth = c.next++;
  rest.forEach((ch) => assignDepths(ch, c));
}

function resolveNode(node: Node, parentRect: Rect | undefined): void {
  const measured = measureNode(node, parentRect?.w);

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
    node.onLayout?.(node.rect, node.depth);
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

function measureNode(node: Node, containingWidth: number | undefined): Size {
  if (node.layout.direction !== undefined && node.children.length > 0) {
    return measureFlex(node);
  }
  return measureBox(node, containingWidth);
}

function definiteWidthOf(node: Node, containingWidth: number | undefined): number | undefined {
  if (node.layout.width !== undefined) return node.layout.width;
  if (
    containingWidth !== undefined &&
    node.layout.left !== undefined &&
    node.layout.right !== undefined
  ) {
    return containingWidth - node.layout.left - node.layout.right;
  }
  return undefined;
}

function availableWidthFor(node: Node, containingWidth: number | undefined): number | undefined {
  const definite = definiteWidthOf(node, containingWidth);
  const max = node.layout.maxWidth;
  if (definite === undefined && max === undefined) return undefined;
  return Math.min(definite ?? Infinity, max ?? Infinity);
}

function measureBox(node: Node, containingWidth: number | undefined): Size {
  const intrinsic =
    typeof node.intrinsic === "function"
      ? node.intrinsic(availableWidthFor(node, containingWidth))
      : node.intrinsic;
  const baseW = node.layout.width ?? intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? intrinsic?.h ?? 0;

  if (node.children.length > 0) {
    let maxW = 0;
    let maxH = 0;
    for (const child of node.children) {
      const cs = measureNode(child, definiteWidthOf(node, containingWidth));
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

  const intrinsic = typeof node.intrinsic === "function" ? undefined : node.intrinsic;
  const baseW = node.layout.width ?? intrinsic?.w ?? 0;
  const baseH = node.layout.height ?? intrinsic?.h ?? 0;
  if (isColumn) {
    return {
      w: node.layout.width === undefined && intrinsic?.w === undefined ? crossMax : baseW,
      h: node.layout.height === undefined && intrinsic?.h === undefined ? mainTotal : baseH,
    };
  }
  return {
    w: node.layout.width === undefined && intrinsic?.w === undefined ? mainTotal : baseW,
    h: node.layout.height === undefined && intrinsic?.h === undefined ? crossMax : baseH,
  };
}

function placeFlex(container: Node, direction: "row" | "column"): void {
  const isColumn = direction === "column";
  const gap = container.layout.gap ?? 0;

  const items = container.children.map((c) => ({ child: c, size: measureNode(c, undefined) }));
  const mainSize = (s: Size) => (isColumn ? s.h : s.w);
  const crossSize = (s: Size) => (isColumn ? s.w : s.h);

  const mains = items.map((it) => mainSize(it.size));
  const packed = mains.reduce((a, b) => a + b, 0) + Math.max(0, items.length - 1) * gap;

  const mainLen = isColumn ? container.rect.h : container.rect.w;
  const crossLen = isColumn ? container.rect.w : container.rect.h;
  const mainBase = isColumn ? container.rect.y : container.rect.x;
  const crossBase = isColumn ? container.rect.x : container.rect.y;

  const justify = container.layout.justifyContent ?? "start";
  const align = container.layout.alignItems ?? "start";

  let pos = mainBase + freeOffset(justify, mainLen - packed);
  for (const { child, size } of items) {
    const crossPos = crossBase + freeOffset(align, crossLen - crossSize(size));
    const childRect = isColumn
      ? { x: crossPos, y: pos, w: size.w, h: size.h }
      : { x: pos, y: crossPos, w: size.w, h: size.h };
    setNodeRect(child, childRect);
    for (const grandchild of child.children) {
      resolveNode(grandchild, child.rect);
    }
    pos += mainSize(size) + gap;
  }
}

/** Distributes free space along an axis: start → 0, end → all, center → half (floored). */
function freeOffset(mode: "start" | "center" | "end", free: number): number {
  return mode === "start" ? 0 : mode === "end" ? free : Math.floor(free / 2);
}
