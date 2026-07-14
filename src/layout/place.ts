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
  let firstInFlow: Node | undefined;
  let lastInFlow: Node | undefined;
  for (const childNode of node.children) {
    if (childNode.isAbsolute()) continue;

    if (!first) mainContentSize += gap;
    first = false;
    firstInFlow ??= childNode;
    lastInFlow = childNode;

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
    const r = placeFlexChild(
      child,
      node,
      pos,
      nextAutoMargin,
      child === firstInFlow,
      child === lastInFlow,
      mainBase,
      mainBase + mainLen,
      bounds,
    );
    pos += r.extent + gap;
    bbox = union(bbox, r.bbox);
  }
  return bbox;
}

function placeBoxChild(child: Node, parent: Node, bounds?: Rect): Rect {
  const { rect, available } = fitRect(child, parent, bounds);
  child.setRect(rect, available);
  return place(child, bounds);
}

function fitRect(child: Node, parent: Node, bounds?: Rect): { rect: Rect; available: Rect } {
  const placed = childRect(child, parent);
  if (!bounds || fits(placed.rect, bounds)) return placed;
  for (const mode of child.layout.positionTryFallbacks ?? []) {
    const r = childRect(child, parent, mirrorOf(mode));
    if (fits(r.rect, bounds)) return r;
  }
  return placed;
}

/** A positioned child's rect and available space against `parent`, optionally with edges mirrored. */
function childRect(
  child: Node,
  parent: Node,
  mirror: Mirror = {},
): { rect: Rect; available: Rect } {
  const x = childPos(child, parent, "x", mirror.x);
  const y = childPos(child, parent, "y", mirror.y);
  return {
    rect: {
      x: x.pos,
      y: y.pos,
      width: child.measured.finalSize.width,
      height: child.measured.finalSize.height,
    },
    available: { x: x.availStart, y: y.availStart, width: x.availSize, height: y.availSize },
  };
}

function mirrorOf(mode: FlipMode): Mirror {
  if (mode === "flip-block") return { y: true }; // block axis = vertical
  if (mode === "flip-inline") return { x: true }; // inline axis = horizontal
  return { x: true, y: true }; // flip-start
}

function childPos(
  child: Node,
  parent: Node,
  axis: "x" | "y",
  mirror?: boolean,
): { pos: number; availStart: number; availSize: number } {
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

  // Both edges set: available space is the edge stretch-box
  if (start !== undefined && end !== undefined) {
    const availStart = base + start + marginStart;
    const availSize = a.stretch(len);
    let pos = availStart;
    if (marginStartAuto || marginEndAuto) {
      const count = (marginStartAuto ? 1 : 0) + (marginEndAuto ? 1 : 0);
      const dist = distributeAutoMargins(availSize - size, count);
      pos = base + start + (marginStartAuto ? dist() : 0);
    }
    return { pos, availStart, availSize };
  }

  // Positioned by the start edge
  if (start !== undefined) {
    const pos = base + start + marginStart;
    return { pos, availStart: pos, availSize: size };
  }

  // Positioned by the end edge
  if (end !== undefined) {
    const pos = base + len - end - marginEnd - size;
    return { pos, availStart: pos, availSize: size };
  }

  // Not positioned at all - default to start edge
  const pos = base + marginStart;
  return { pos, availStart: pos, availSize: size };
}

function placeFlexChild(
  child: Node,
  parent: Node,
  pos: number,
  nextAutoMargin: () => number,
  first: boolean,
  last: boolean,
  mainStart: number,
  mainEnd: number,
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
  const extent = mStart + mainSize + mEnd;
  const mainAvailStart = first ? mainStart + main.marginStart : pos + main.marginStart;
  const mainAvailEnd = last ? mainEnd - main.marginEnd : pos + extent - main.marginEnd;
  const mainAvailSize = Math.max(0, mainAvailEnd - mainAvailStart);

  const crossContentStart = col ? parent.contentRect.x : parent.contentRect.y;
  const crossAvailStart = crossContentStart + cross.marginStart;
  const crossContentSize = col ? parent.contentRect.width : parent.contentRect.height;
  const crossAvailSize = cross.stretch(crossContentSize);
  const free = crossAvailSize - crossSize;
  const crossPos = crossAvailStart + alignOffset(free, parent.layout.alignItems);

  if (col)
    child.setRect(
      { x: crossPos, y: mainPos, width: crossSize, height: mainSize },
      { x: crossAvailStart, y: mainAvailStart, width: crossAvailSize, height: mainAvailSize },
    );
  else
    child.setRect(
      { x: mainPos, y: crossPos, width: mainSize, height: crossSize },
      { x: mainAvailStart, y: crossAvailStart, width: mainAvailSize, height: crossAvailSize },
    );
  return { extent, bbox: place(child, bounds) };
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
