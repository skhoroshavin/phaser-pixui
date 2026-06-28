import { type Node } from "./node";

export function place(node: Node): void {
  if (node.isFlex) {
    placeFlex(node);
    return;
  }

  for (const child of node.children) {
    placeBoxChild(child, node);
  }
}

function placeBoxChild(child: Node, parent: Node): void {
  child.setRect({
    x: childPos(child, parent, "x"),
    y: childPos(child, parent, "y"),
    w: child.measured.finalSize.w,
    h: child.measured.finalSize.h,
  });
  place(child);
}

function childPos(child: Node, parent: Node, axis: "x" | "y"): number {
  const horizontal = axis === "x";
  const a = horizontal ? child.xAxis : child.yAxis;
  const size = horizontal ? child.measured.finalSize.w : child.measured.finalSize.h;
  const base = horizontal ? parent.rect.x : parent.rect.y;
  const len = horizontal ? parent.rect.w : parent.rect.h;

  // Auto-margin centering
  if (a.marginAuto && a.start !== undefined && a.end !== undefined) {
    const free = len - a.start - a.end - size;
    return base + a.start + (free > 0 ? Math.ceil(free / 2) : 0);
  }

  // Positioned by the start edge
  if (a.start !== undefined) return base + a.start + a.marginStart;

  // Positioned by the end edge
  if (a.end !== undefined) return base + len - a.end - a.marginEnd - size;

  // Not positioned at all - default to start edge
  return base + a.marginStart;
}

function placeFlex(node: Node): void {
  const l = node.layout;
  const gap = l.gap ?? 0;

  const col = l.direction === "column";
  const mainLen = col ? node.rect.h : node.rect.w;
  const mainBase = col ? node.rect.y : node.rect.x;

  // Pass 1: main content size + auto-margin count
  let autoMarginCount = 0;
  let mainContentSize = 0;
  let first = true;
  for (const childNode of node.children) {
    if (childNode.isAbsolute(node)) continue;

    if (!first) mainContentSize += gap;
    first = false;

    const child = col ? childNode.yAxis : childNode.xAxis;
    const childSize = col ? childNode.measured.finalSize.h : childNode.measured.finalSize.w;
    if (child.marginStartAuto) autoMarginCount++;
    if (child.marginEndAuto) autoMarginCount++;
    mainContentSize += childSize + child.marginStart + child.marginEnd;
  }
  const mainFreeSpace = mainLen - mainContentSize;
  const absorbFreeSpace = mainFreeSpace > 0 && autoMarginCount > 0;
  const nextAutoMargin = distributeAutoMargins(mainFreeSpace, autoMarginCount);

  // Pass 2: position each item
  let pos = mainBase + (absorbFreeSpace ? 0 : alignOffset(mainFreeSpace, l.justifyContent));
  for (const child of node.children) {
    if (child.isAbsolute(node)) {
      placeBoxChild(child, node);
      continue;
    }
    pos += placeFlexChild(child, node, pos, nextAutoMargin) + gap;
  }
}

function placeFlexChild(
  child: Node,
  parent: Node,
  pos: number,
  nextAutoMargin: () => number,
): number {
  const col = parent.layout.direction === "column";
  const main = col ? child.yAxis : child.xAxis;
  const cross = col ? child.xAxis : child.yAxis;
  const mainSize = col ? child.measured.finalSize.h : child.measured.finalSize.w;
  const crossSize = col ? child.measured.finalSize.w : child.measured.finalSize.h;
  const mStart = main.marginStartAuto ? nextAutoMargin() : main.marginStart;
  const mEnd = main.marginEndAuto ? nextAutoMargin() : main.marginEnd;

  const mainPos = pos + mStart;

  const crossSpace = col ? parent.rect.w : parent.rect.h;
  const crossBase = col ? parent.rect.x : parent.rect.y;
  const free = crossSpace - cross.extent(crossSize);
  const crossPos = crossBase + cross.marginStart + alignOffset(free, parent.layout.alignItems);

  if (col) child.setRect({ x: crossPos, y: mainPos, w: crossSize, h: mainSize });
  else child.setRect({ x: mainPos, y: crossPos, w: mainSize, h: crossSize });
  place(child);

  return mStart + mainSize + mEnd;
}

function distributeAutoMargins(freeSpace: number, count: number): () => number {
  const active = count > 0 && freeSpace > 0;
  const q = active ? Math.floor(freeSpace / count) : 0;
  const r = active ? freeSpace % count : 0;
  let i = 0;
  return () => q + (i++ < r ? 1 : 0);
}

function alignOffset(freeSpace: number, mode?: "start" | "end" | "center" | "stretch"): number {
  return mode === "end" ? freeSpace : mode === "center" ? Math.ceil(freeSpace / 2) : 0;
}
