import { describe, expect, it } from "vitest";
import { createNode, resolve, type Node } from "./";

describe("box", () => {
  function viewport(w: number, h: number): Node {
    return createNode({ layout: { width: w, height: h } });
  }

  it.each([
    // end edges
    {
      name: "right edge + intrinsic width",
      box: { right: 4 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 216, y: 0, w: 100, h: 16 },
    },
    {
      name: "bottom edge + intrinsic height",
      box: { bottom: 8 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 0, y: 216, w: 100, h: 16 },
    },
    {
      name: "right edge + explicit width",
      box: { right: 4, width: 200 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 116, y: 0, w: 200, h: 16 },
    },
    {
      name: "bottom edge + explicit height",
      box: { bottom: 8, height: 50 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 0, y: 182, w: 100, h: 50 },
    },
    // start edges
    {
      name: "left edge + explicit width",
      box: { left: 10, width: 80 },
      expected: { x: 10, y: 0, w: 80, h: 0 },
    },
    {
      name: "top edge + explicit height",
      box: { top: 20, height: 50 },
      expected: { x: 0, y: 20, w: 0, h: 50 },
    },
    // stretch
    {
      name: "horizontal stretch (left + right, no width)",
      box: { left: 10, right: 20 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 10, y: 0, w: 290, h: 16 },
    },
    {
      name: "vertical stretch (top + bottom, no height)",
      box: { top: 10, bottom: 20 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 0, y: 10, w: 100, h: 210 },
    },
    // over-constrained
    {
      name: "left + right + width, right ignored",
      box: { left: 10, right: 20, width: 100 },
      expected: { x: 10, y: 0, w: 100, h: 0 },
    },
    {
      name: "top + bottom + height, bottom ignored",
      box: { top: 10, bottom: 20, height: 50 },
      expected: { x: 0, y: 10, w: 0, h: 50 },
    },
    // no edges, explicit size
    {
      name: "no horizontal edges, explicit width",
      box: { width: 80 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 0, y: 0, w: 80, h: 16 },
    },
    {
      name: "no vertical edges, explicit height",
      box: { height: 50 },
      intrinsic: { w: 100, h: 16 },
      expected: { x: 0, y: 0, w: 100, h: 50 },
    },
    // degenerate
    {
      name: "no edges, no length, intrinsic only",
      box: {},
      intrinsic: { w: 80, h: 20 },
      expected: { x: 0, y: 0, w: 80, h: 20 },
    },
    // concrete margins
    {
      name: "marginLeft offset from start edge",
      box: { left: 10, marginLeft: 5, width: 80 },
      expected: { x: 15, y: 0, w: 80, h: 0 },
    },
    {
      name: "marginLeft/marginTop with auto length",
      box: { marginLeft: 10, marginTop: 5 },
      intrinsic: { w: 80, h: 20 },
      expected: { x: 10, y: 5, w: 80, h: 20 },
    },
    // auto centering
    {
      name: "auto-center horizontal, explicit width",
      box: { width: 100, marginX: "auto" },
      expected: { x: 110, y: 0, w: 100, h: 0 },
    },
    {
      name: "auto-center vertical, explicit height",
      box: { height: 50, marginY: "auto" },
      expected: { x: 0, y: 95, w: 0, h: 50 },
    },
    {
      name: "auto-center both axes, explicit size",
      box: {
        width: 100,
        height: 50,
        marginX: "auto",
        marginY: "auto",
      },
      expected: { x: 110, y: 95, w: 100, h: 50 },
    },
    {
      name: "auto-center horizontal, intrinsic width",
      box: { marginX: "auto" },
      intrinsic: { w: 80, h: 20 },
      expected: { x: 120, y: 0, w: 80, h: 20 },
    },
    {
      name: "auto-center horizontal, edges also set",
      box: { left: 10, right: 10, width: 100, marginX: "auto" },
      expected: { x: 110, y: 0, w: 100, h: 0 },
    },
    // single auto margin
    {
      name: "single-side auto margin resolves to zero",
      box: { left: 10, width: 80, marginLeft: "auto" },
      expected: { x: 10, y: 0, w: 80, h: 0 },
    },
  ] as const)("$name", ({ box, intrinsic, expected }) => {
    const root = viewport(320, 240);
    root.children = [createNode({ layout: box, intrinsic })];
    resolve(root);
    expect(root.children[0]!.rect).toEqual(expected);
  });

  it("distributes odd free space with lower slot first", () => {
    const root = viewport(321, 240);
    root.children = [createNode({ layout: { width: 100, marginX: "auto" } })];
    resolve(root);
    expect(root.children[0]!.rect).toEqual({ x: 111, y: 0, w: 100, h: 0 });
  });

  it("auto-sizes height from child intrinsic when no explicit height", () => {
    const root = viewport(320, 240);
    const container = createNode({
      layout: { left: 0, top: 0, width: 200 },
    });
    const child = createNode({
      layout: { width: 100 },
      intrinsic: { w: 80, h: 30 },
    });
    container.children = [child];
    root.children = [container];

    resolve(root);

    expect(container.rect).toEqual({ x: 0, y: 0, w: 200, h: 30 });
  });

  it("auto-sizes width from child with explicit width", () => {
    const root = viewport(320, 240);
    const container = createNode({ layout: {} });
    const child = createNode({
      layout: { width: 80 },
      intrinsic: { h: 50 },
    });
    container.children = [child];
    root.children = [container];

    resolve(root);

    expect(container.rect).toEqual({ x: 0, y: 0, w: 80, h: 50 });
  });

  it("recursively auto-sizes through nested containers", () => {
    const root = viewport(320, 240);
    const outer = createNode({ layout: {} });
    const inner = createNode({ layout: {} });
    const leaf = createNode({
      layout: { width: 50 },
      intrinsic: { h: 30 },
    });
    inner.children = [leaf];
    outer.children = [inner];
    root.children = [outer];

    resolve(root);

    expect(outer.rect).toEqual({ x: 0, y: 0, w: 50, h: 30 });
  });
});
