import { type Node, type Size } from "./node";

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
  const cl = child.layout;
  if (cl.width !== undefined) return cl.width;

  // Parent didn't calculate width - we also cannot
  const parentWidth = parent.measured.topDownWidth;
  if (parentWidth === undefined) return undefined;

  // Flex row children never stretch width
  const pl = parent.layout;
  if (pl.direction === "row") return undefined;

  // Plain box child: if both edges are set - just stretch between them
  const x = child.xAxis;
  const parentContentWidth = parent.xAxis.contentSize(parentWidth);
  if (pl.direction === undefined) {
    if (!x.hasBothEdges) return undefined;
    return x.stretch(parentContentWidth);
  }

  // Flex column: if alignItems is stretch and child is not absolute - stretch it
  if ((pl.alignItems ?? "stretch") !== "stretch") return undefined;
  if (child.isAbsolute(parent)) return undefined;
  return x.stretch(parentContentWidth);
}

export function measureBottomUp(node: Node): void {
  for (const child of node.children) measureBottomUp(child);

  node.measured.bottomUpSize = node.isFlex ? measureFlex(node) : measureBox(node);

  const l = node.layout;
  if (l.maxWidth === undefined) return;
  node.measured.bottomUpSize.w = Math.min(node.measured.bottomUpSize.w, l.maxWidth);
}

function measureBox(node: Node): Size {
  const l = node.layout;
  const availableW = node.clampWidth(node.measured.topDownWidth) ?? l.maxWidth;
  const { w: iw, h: ih } = node.intrinsicSize(availableW);

  let aggW = 0;
  let aggH = 0;
  for (const child of node.children) {
    const size = child.measured.bottomUpSize;
    aggW = Math.max(aggW, child.xAxis.extent(size.w));
    aggH = Math.max(aggH, child.yAxis.extent(size.h));
  }
  return {
    w: l.width ?? Math.max(iw, node.xAxis.actualSize(aggW)),
    h: l.height ?? Math.max(ih, node.yAxis.actualSize(aggH)),
  };
}

function measureFlex(node: Node): Size {
  const l = node.layout;
  const gap = l.gap ?? 0;
  const col = l.direction === "column";

  let mainFlowTotal = 0;
  let mainAbsMax = 0;
  let crossMax = 0;
  let flowCount = 0;

  for (const child of node.children) {
    const size = child.measured.bottomUpSize;
    const main = col ? child.yAxis : child.xAxis;
    const cross = col ? child.xAxis : child.yAxis;
    const mainSize = col ? size.h : size.w;
    const crossSize = col ? size.w : size.h;

    if (child.isAbsolute(node)) {
      mainAbsMax = Math.max(mainAbsMax, main.extent(mainSize));
      crossMax = Math.max(crossMax, cross.extent(crossSize));
    } else {
      if (flowCount > 0) mainFlowTotal += gap;
      flowCount++;
      mainFlowTotal += main.extent(mainSize);
      crossMax = Math.max(crossMax, cross.extent(crossSize));
    }
  }
  const mainMax = Math.max(mainFlowTotal, mainAbsMax);
  const main = col ? node.yAxis : node.xAxis;
  const cross = col ? node.xAxis : node.yAxis;

  return col
    ? {
        w: l.width ?? cross.actualSize(crossMax),
        h: l.height ?? main.actualSize(mainMax),
      }
    : {
        w: l.width ?? main.actualSize(mainMax),
        h: l.height ?? cross.actualSize(crossMax),
      };
}

export function seedRootRect(node: Node): void {
  const { w, h } = node.measured.bottomUpSize;
  node.measured.finalSize = { w, h };
  node.setRect({ x: 0, y: 0, w, h });
}

export function finalizeSize(node: Node): void {
  for (const child of node.children) {
    child.measured.finalSize = {
      w: child.clampWidth(childFinalSize(child, node, "x"))!,
      h: childFinalSize(child, node, "y"),
    };
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
  const parentContentSize = pa.contentSize(
    horizontal ? parent.measured.finalSize.w : parent.measured.finalSize.h,
  );
  if (a.hasBothEdges) return a.stretch(parentContentSize);

  // Flex cross-axis: if alignItems is stretch and child is not absolute - stretch it
  const pl = parent.layout;
  const crossDir = horizontal ? "column" : "row";
  const bottomUp = horizontal ? child.measured.bottomUpSize.w : child.measured.bottomUpSize.h;
  if (pl.direction !== crossDir) return bottomUp;
  if ((pl.alignItems ?? "stretch") !== "stretch") return bottomUp;
  if (child.isAbsolute(parent)) return bottomUp;
  return a.stretch(parentContentSize);
}
