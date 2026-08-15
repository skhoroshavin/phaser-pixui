import { type Node } from "./node";
import type { Size } from "../shared/size";

export function seedWidths(node: Node): void {
  node.measured.topDownWidth = node.clampWidth(node.layout.width);
  for (const child of node.children) seedWidths(child);
}

export function measureTopDown(node: Node): void {
  applyGrow(node, "measureTopDown");
  for (const child of node.children) {
    child.measured.topDownWidth = child.clampWidth(childTopDownWidth(child, node));
    measureTopDown(child);
  }
}

function childTopDownWidth(child: Node, parent: Node): number | undefined {
  // Explicit width always wins
  if (child.layout.width !== undefined) return child.layout.width;

  // Width assigned earlier wins
  if (child.measured.topDownWidth !== undefined) return child.measured.topDownWidth;

  // Parent width unknown and no maxWidth cap - we also cannot
  const parentWidth = parent.measured.topDownWidth ?? parent.layout.maxWidth;
  if (parentWidth === undefined) return undefined;

  const x = child.xAxis;
  const pl = parent.layout;

  // Absolute child stretches between both edges (fit-content when a margin is auto)
  if (child.isAbsolute()) {
    if (!x.hasBothEdges) return undefined;
    if (x.marginStartAuto || x.marginEndAuto) return undefined;
    return x.stretch(parentWidth);
  }

  // Row flow children never stretch on the main (width) axis
  if (pl.direction === "row") return undefined;

  // Column children are measured against the container content width so text wraps, not overflows
  return x.stretch(parent.xAxis.contentSize(parentWidth));
}

export function measureBottomUp(node: Node): void {
  for (const child of node.children) measureBottomUp(child);

  node.measured.bottomUpSize = measureFlex(node);

  const l = node.layout;
  if (l.maxWidth === undefined) return;
  node.measured.bottomUpSize.width = Math.min(node.measured.bottomUpSize.width, l.maxWidth);
}

function measureFlex(node: Node): Size {
  const l = node.layout;
  const gap = l.gap ?? 0;
  const col = l.direction !== "row";

  let mainFlowTotal = 0;
  let crossMax = 0;
  let flowCount = 0;

  for (const child of node.children) {
    if (child.isAbsolute()) continue;
    const size = child.measured.bottomUpSize;
    const main = col ? child.yAxis : child.xAxis;
    const cross = col ? child.xAxis : child.yAxis;
    const mainSize = col ? size.height : size.width;
    const crossSize = col ? size.width : size.height;

    if (flowCount > 0) mainFlowTotal += gap;
    flowCount++;
    mainFlowTotal += main.extent(mainSize);
    crossMax = Math.max(crossMax, cross.extent(crossSize));
  }
  const main = col ? node.yAxis : node.xAxis;
  const cross = col ? node.xAxis : node.yAxis;

  const availableW = node.clampWidth(node.measured.topDownWidth) ?? l.maxWidth;
  const { width: iw, height: ih } = node.intrinsicSize(availableW);

  return col
    ? {
        width: l.width ?? Math.max(iw, cross.actualSize(crossMax)),
        height: l.height ?? Math.max(ih, main.actualSize(mainFlowTotal)),
      }
    : {
        width: l.width ?? Math.max(iw, main.actualSize(mainFlowTotal)),
        height: l.height ?? Math.max(ih, cross.actualSize(crossMax)),
      };
}

export function seedRootRect(node: Node): void {
  const { width, height } = node.measured.bottomUpSize;
  node.measured.finalSize = { width, height };
  node.setRect({ x: 0, y: 0, width, height });
}

export function finalizeSize(node: Node): void {
  for (const child of node.children) {
    child.measured.finalSize = {
      width: child.clampWidth(childFinalSize(child, node, "x"))!,
      height: childFinalSize(child, node, "y"),
    };
  }
  applyGrow(node, "finalizeSize");
  for (const child of node.children) {
    finalizeSize(child);
  }
}

function childFinalSize(child: Node, parent: Node, axis: "x" | "y"): number {
  const horizontal = axis === "x";
  const cl = child.layout;

  // Explicit size always wins
  const explicit = horizontal ? cl.width : cl.height;
  if (explicit !== undefined) return explicit;

  // If both edges are set - just stretch between them
  const a = horizontal ? child.xAxis : child.yAxis;
  const pa = horizontal ? parent.xAxis : parent.yAxis;
  const parentSize = horizontal
    ? parent.measured.finalSize.width
    : parent.measured.finalSize.height;
  // Stretch if both edges are set, unless a margin is auto
  if (a.hasBothEdges && !a.marginStartAuto && !a.marginEndAuto) return a.stretch(parentSize);

  const pl = parent.layout;
  const bottomUp = horizontal
    ? child.measured.bottomUpSize.width
    : child.measured.bottomUpSize.height;

  // Measuring along parent's main axis
  if ((pl.direction ?? "column") === (horizontal ? "row" : "column")) {
    if (!horizontal) return bottomUp;
    // Snap to previously computed top-down width, if available
    return child.measured.topDownWidth ?? bottomUp;
  }

  // Measuring along parent's cross-axis
  if ((pl.alignItems ?? "stretch") !== "stretch") return bottomUp;
  if (child.isAbsolute()) return bottomUp;
  // If alignItems is stretch and the child is not absolute - stretch it against content edges
  return a.stretch(pa.contentSize(parentSize));
}

function applyGrow(node: Node, phase: "measureTopDown" | "finalizeSize"): void {
  const horizontal = phase === "measureTopDown";
  if (horizontal && node.layout.direction !== "row") return;
  if (!horizontal && node.layout.direction === "row") return;

  const a = horizontal ? node.xAxis : node.yAxis;
  const containerSize = horizontal ? node.measured.topDownWidth : node.measured.finalSize.height;
  if (containerSize === undefined) return;

  const gap = node.layout.gap ?? 0;
  let free = a.contentSize(containerSize);
  let totalGrow = 0;
  let first = true;
  const shares: { child: Node; g: number; add: number; frac: number }[] = [];
  for (const child of node.children) {
    if (child.isAbsolute()) continue;
    if (first) first = false;
    else free -= gap;

    const c = child.measured;
    if (phase === "measureTopDown") free -= a.extent(c.bottomUpSize.width);
    else free -= a.extent(c.finalSize.height);
    if (free <= 0) return; // no free space left - cannot grow

    const g = child.layout.grow ?? 0;
    if (g > 0) {
      totalGrow += g;
      shares.push({ child, g, add: 0, frac: 0 });
    }
  }
  if (totalGrow === 0) return;

  // Largest-remainder: floor each share, leftover pixels to the largest fractional remainders
  let leftover = free;
  for (const s of shares) {
    s.add = Math.floor((free * s.g) / totalGrow);
    s.frac = (free * s.g) % totalGrow;
    leftover -= s.add;
  }

  shares.sort((a, b) => b.frac - a.frac); // stable sort → document order on ties
  shares.forEach((s, i) => {
    if (i < leftover) s.add++;
    const child = s.child.measured;
    if (phase === "measureTopDown") child.topDownWidth = child.bottomUpSize.width + s.add;
    else child.finalSize.height += s.add;
  });
}
