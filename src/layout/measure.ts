import { type Node } from "./node";
import type { Size } from "../shared/size";

export function seedRootWidth(node: Node): void {
  node.measured.topDownWidth = node.clampWidth(node.layout.width);
}

export function measureTopDown(node: Node): void {
  for (const child of node.children) {
    child.measured.topDownWidth = child.clampWidth(childTopDownWidth(child, node));
    measureTopDown(child);
  }
}

function childTopDownWidth(child: Node, parent: Node): number | undefined {
  // Explicit width always wins
  if (child.layout.width !== undefined) return child.layout.width;

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
  applyGrow(node);
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

  // if alignItems is stretch and child is not absolute - stretch it against content edges
  const pl = parent.layout;
  const crossDir = horizontal ? "column" : "row";
  const bottomUp = horizontal
    ? child.measured.bottomUpSize.width
    : child.measured.bottomUpSize.height;
  if ((pl.direction ?? "column") !== crossDir) return bottomUp;
  if ((pl.alignItems ?? "stretch") !== "stretch") return bottomUp;
  if (child.isAbsolute()) return bottomUp;
  return a.stretch(pa.contentSize(parentSize));
}

function applyGrow(node: Node): void {
  const l = node.layout;
  const col = l.direction !== "row";
  const gap = l.gap ?? 0;
  const mainAxis = col ? node.yAxis : node.xAxis;

  let free = mainAxis.contentSize(
    col ? node.measured.finalSize.height : node.measured.finalSize.width,
  );
  let totalGrow = 0;
  let first = true;
  const shares: { child: Node; g: number; add: number; frac: number }[] = [];
  for (const child of node.children) {
    if (child.isAbsolute()) continue;

    if (!first) free -= gap;
    first = false;

    const cAxis = col ? child.yAxis : child.xAxis;
    const base = col ? child.measured.finalSize.height : child.measured.finalSize.width;
    free -= cAxis.extent(base);
    if (free <= 0) return; // no free space left - cannot grow

    const g = child.layout.grow ?? 0;
    if (g > 0) {
      totalGrow += g;
      shares.push({ child, g, add: 0, frac: 0 });
    }
  }

  if (totalGrow === 0) return; // nothing to grow

  // Largest-remainder (Hamilton): floor each share, then hand the leftover pixels
  // to the children with the largest fractional remainders (ties by document order).
  let leftover = free;
  for (const s of shares) {
    s.add = Math.floor((free * s.g) / totalGrow);
    s.frac = (free * s.g) % totalGrow;
    leftover -= s.add;
  }

  shares.sort((a, b) => b.frac - a.frac); // stable sort → document order on ties
  shares.forEach((s, i) => {
    if (i < leftover) s.add++;
    if (col) s.child.measured.finalSize.height += s.add;
    else s.child.measured.finalSize.width += s.add;
  });
}
