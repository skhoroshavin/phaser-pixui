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
