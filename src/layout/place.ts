import { type Node } from "./node";
import { type FlipMode } from "./layout";
import { type Rect, fits } from "../shared/rect";

/** Per-axis edge mirroring for position fallbacks (x = left↔right, y = top↔bottom). */
type Mirror = { x?: boolean; y?: boolean };

/** Place a subtree; returns the bounding box of the node and all descendants. */
export function place(node: Node, bounds?: Rect): Rect {
  const l = node.layout;
  const gap = l.gap ?? 0;

  const col = l.direction !== "row";
  const mainAxis = col ? node.yAxis : node.xAxis;
  const mainLen = mainAxis.contentSize(col ? node.rect.height : node.rect.width);
  const mainBase = mainAxis.contentStart(col ? node.rect.y : node.rect.x);

  // Pass 1: main content size + auto-margin count
  let autoMarginCount = 0;
  let mainContentSize = 0;
  let first = true;
  for (const childNode of node.children) {
    if (childNode.isAbsolute()) continue;

    if (!first) mainContentSize += gap;
    first = false;

    const child = col ? childNode.yAxis : childNode.xAxis;
    const childSize = col
      ? childNode.measured.finalSize.height
      : childNode.measured.finalSize.width;
    if (child.marginStartAuto) autoMarginCount++;
    if (child.marginEndAuto) autoMarginCount++;
    mainContentSize += childSize + child.marginStart + child.marginEnd;
  }
  const mainFreeSpace = mainLen - mainContentSize;
  const absorbFreeSpace = mainFreeSpace > 0 && autoMarginCount > 0;
  const nextAutoMargin = distributeAutoMargins(mainFreeSpace, autoMarginCount);

  // Pass 2: position each item
  let pos = mainBase + (absorbFreeSpace ? 0 : alignOffset(mainFreeSpace, l.justifyContent));
  let bbox: Rect = { ...node.rect };
  for (const child of node.children) {
    if (child.isAbsolute()) {
      bbox = union(bbox, placeBoxChild(child, node, bounds));
      continue;
    }
    const r = placeFlexChild(child, node, pos, nextAutoMargin, bounds);
    pos += r.extent + gap;
    bbox = union(bbox, r.bbox);
  }
  return bbox;
}

function placeBoxChild(child: Node, parent: Node, bounds?: Rect): Rect {
  child.setRect(fitRect(child, parent, bounds));
  return place(child, bounds);
}

function fitRect(child: Node, parent: Node, bounds?: Rect): Rect {
  const rect = childRect(child, parent);
  if (!bounds || fits(rect, bounds)) return rect;
  for (const mode of child.layout.positionTryFallbacks ?? []) {
    const r = childRect(child, parent, mirrorOf(mode));
    if (fits(r, bounds)) return r;
  }
  return rect;
}

/** A positioned child's rect against `parent`, optionally with edges mirrored. */
function childRect(child: Node, parent: Node, mirror: Mirror = {}): Rect {
  return {
    x: childPos(child, parent, "x", mirror.x),
    y: childPos(child, parent, "y", mirror.y),
    width: child.measured.finalSize.width,
    height: child.measured.finalSize.height,
  };
}

function mirrorOf(mode: FlipMode): Mirror {
  if (mode === "flip-block") return { y: true }; // block axis = vertical
  if (mode === "flip-inline") return { x: true }; // inline axis = horizontal
  return { x: true, y: true }; // flip-start
}

function childPos(child: Node, parent: Node, axis: "x" | "y", mirror?: boolean): number {
  const horizontal = axis === "x";
  const a = horizontal ? child.xAxis : child.yAxis;
  // Mirror swaps start/end and their margins on this axis
  const start = mirror ? a.end : a.start;
  const end = mirror ? a.start : a.end;
  const marginStart = mirror ? a.marginEnd : a.marginStart;
  const marginEnd = mirror ? a.marginStart : a.marginEnd;
  const marginStartAuto = mirror ? a.marginEndAuto : a.marginStartAuto;
  const marginEndAuto = mirror ? a.marginStartAuto : a.marginEndAuto;

  const base = horizontal ? parent.rect.x : parent.rect.y;
  const len = horizontal ? parent.rect.width : parent.rect.height;
  const size = horizontal ? child.measured.finalSize.width : child.measured.finalSize.height;

  // Auto-margin distribution, similar to flex rules
  if ((marginStartAuto || marginEndAuto) && start !== undefined && end !== undefined) {
    const count = (marginStartAuto ? 1 : 0) + (marginEndAuto ? 1 : 0);
    const dist = distributeAutoMargins(len - start - end - size, count);
    return base + start + (marginStartAuto ? dist() : 0);
  }

  // Positioned by the start edge
  if (start !== undefined) return base + start + marginStart;

  // Positioned by the end edge
  if (end !== undefined) return base + len - end - marginEnd - size;

  // Not positioned at all - default to start edge
  return base + marginStart;
}

function placeFlexChild(
  child: Node,
  parent: Node,
  pos: number,
  nextAutoMargin: () => number,
  bounds?: Rect,
): { extent: number; bbox: Rect } {
  const col = parent.layout.direction !== "row";
  const main = col ? child.yAxis : child.xAxis;
  const cross = col ? child.xAxis : child.yAxis;
  const mainSize = col ? child.measured.finalSize.height : child.measured.finalSize.width;
  const crossSize = col ? child.measured.finalSize.width : child.measured.finalSize.height;
  const mStart = main.marginStartAuto ? nextAutoMargin() : main.marginStart;
  const mEnd = main.marginEndAuto ? nextAutoMargin() : main.marginEnd;

  const mainPos = pos + mStart;

  const crossSpace = col
    ? parent.xAxis.contentSize(parent.rect.width)
    : parent.yAxis.contentSize(parent.rect.height);
  const crossBase = col
    ? parent.xAxis.contentStart(parent.rect.x)
    : parent.yAxis.contentStart(parent.rect.y);
  const free = crossSpace - cross.extent(crossSize);
  const crossPos = crossBase + cross.marginStart + alignOffset(free, parent.layout.alignItems);

  if (col) child.setRect({ x: crossPos, y: mainPos, width: crossSize, height: mainSize });
  else child.setRect({ x: mainPos, y: crossPos, width: mainSize, height: crossSize });
  return { extent: mStart + mainSize + mEnd, bbox: place(child, bounds) };
}

function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
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
