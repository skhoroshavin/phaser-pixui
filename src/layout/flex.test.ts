import { describe, expect, it } from "vitest";
import { createNode, resolve } from "./";

describe("flex", () => {
  it("stacks children vertically in a column with gap", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { left: 0, top: 0, width: 200, height: 200, direction: "column", gap: 8 },
    });
    const child1 = createNode({ layout: { width: 100, height: 30 } });
    const child2 = createNode({ layout: { width: 80, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 200, h: 200 });
    expect(child1.rect).toEqual({ x: 0, y: 0, w: 100, h: 30 });
    expect(child2.rect).toEqual({ x: 0, y: 38, w: 80, h: 20 });
  });

  it("auto-sizes column to wrap children", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { left: 0, top: 0, direction: "column", gap: 4 },
    });
    const child1 = createNode({ layout: { width: 100, height: 30 } });
    const child2 = createNode({ layout: { width: 80, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 100, h: 54 });
    expect(child1.rect).toEqual({ x: 0, y: 0, w: 100, h: 30 });
    expect(child2.rect).toEqual({ x: 0, y: 34, w: 80, h: 20 });
  });

  it("places children side by side in a row with gap", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { left: 0, top: 0, width: 300, height: 50, direction: "row", gap: 8 },
    });
    const child1 = createNode({ layout: { width: 100, height: 30 } });
    const child2 = createNode({ layout: { width: 80, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 300, h: 50 });
    expect(child1.rect).toEqual({ x: 0, y: 0, w: 100, h: 30 });
    expect(child2.rect).toEqual({ x: 108, y: 0, w: 80, h: 20 });
  });

  it("auto-sizes row to wrap children", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { left: 0, top: 0, direction: "row", gap: 4 },
    });
    const child1 = createNode({ layout: { width: 100, height: 30 } });
    const child2 = createNode({ layout: { width: 80, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 184, h: 30 });
    expect(child1.rect).toEqual({ x: 0, y: 0, w: 100, h: 30 });
    expect(child2.rect).toEqual({ x: 104, y: 0, w: 80, h: 20 });
  });

  it("centers children on cross-axis when alignItems is center", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        alignItems: "center",
      },
    });
    const child1 = createNode({ layout: { width: 80, height: 30 } });
    const child2 = createNode({ layout: { width: 60, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    // cross-axis: width 80 in 200 → x = floor((200-80)/2) = 60
    // cross-axis: width 60 in 200 → x = floor((200-60)/2) = 70
    // main-axis: gap 8 → child2.y = 0 + 30 + 8 = 38
    expect(child1.rect).toEqual({ x: 60, y: 0, w: 80, h: 30 });
    expect(child2.rect).toEqual({ x: 70, y: 38, w: 60, h: 20 });
  });

  it("aligns children to cross-axis end when alignItems is end", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        alignItems: "end",
      },
    });
    const child1 = createNode({ layout: { width: 80, height: 30 } });
    const child2 = createNode({ layout: { width: 60, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    // cross-axis: width 80 in 200 → x = 200 - 80 = 120
    // cross-axis: width 60 in 200 → x = 200 - 60 = 140
    // main-axis: gap 8 → child2.y = 0 + 30 + 8 = 38
    expect(child1.rect).toEqual({ x: 120, y: 0, w: 80, h: 30 });
    expect(child2.rect).toEqual({ x: 140, y: 38, w: 60, h: 20 });
  });

  it("centers packed children on main-axis when justifyContent is center", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        justifyContent: "center",
      },
    });
    const child1 = createNode({ layout: { width: 80, height: 30 } });
    const child2 = createNode({ layout: { width: 60, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    // packed = 30 + 8 + 20 = 58; free in 100 → 42; lead = floor(42/2) = 21
    expect(child1.rect).toEqual({ x: 0, y: 21, w: 80, h: 30 });
    expect(child2.rect).toEqual({ x: 0, y: 59, w: 60, h: 20 });
  });

  it("aligns packed children to main-axis end when justifyContent is end", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        justifyContent: "end",
      },
    });
    const child1 = createNode({ layout: { width: 80, height: 30 } });
    const child2 = createNode({ layout: { width: 60, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    // packed = 30 + 8 + 20 = 58; free in 100 → 42; lead = full free space
    expect(child1.rect).toEqual({ x: 0, y: 42, w: 80, h: 30 });
    expect(child2.rect).toEqual({ x: 0, y: 80, w: 60, h: 20 });
  });

  it("stacks flex children with nested intrinsic sizes", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { direction: "column", gap: 4 },
    });
    const wrapA = createNode({});
    const leafA = createNode({
      layout: { width: 80 },
      intrinsic: { h: 20 },
    });
    wrapA.children = [leafA];
    const wrapB = createNode({});
    const leafB = createNode({
      layout: { width: 60 },
      intrinsic: { h: 15 },
    });
    wrapB.children = [leafB];

    flex.children = [wrapA, wrapB];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 80, h: 39 });
    expect(wrapA.rect).toEqual({ x: 0, y: 0, w: 80, h: 20 });
    expect(wrapB.rect).toEqual({ x: 0, y: 24, w: 60, h: 15 });
  });

  it("stacks flex child with inset-0 leaf", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { direction: "column", gap: 2 },
    });
    const wrapper = createNode({});
    const leaf = createNode({
      layout: { inset: 0 },
      intrinsic: { h: 22 },
    });
    wrapper.children = [leaf];
    flex.children = [wrapper];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 0, h: 22 });
    expect(wrapper.rect).toEqual({ x: 0, y: 0, w: 0, h: 22 });
    expect(leaf.rect).toEqual({ x: 0, y: 0, w: 0, h: 22 });
  });
});
