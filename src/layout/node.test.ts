import { describe, expect, it } from "vitest";
import { createNode, resolve, type Node, type Rect } from "./node";

describe("createNode", () => {
  it("creates node with defaults when called without arguments", () => {
    const node = createNode({});

    expect(node.box.right).toBeUndefined();
    expect(node.box.bottom).toBeUndefined();
    expect(node.children).toEqual([]);
    expect(node.rect.x).toBeNaN();
    expect(node.rect.y).toBeNaN();
    expect(node.rect.w).toBeNaN();
    expect(node.rect.h).toBeNaN();
    expect(node.intrinsic).toBeUndefined();
    expect(node.onLayout).toBeUndefined();
  });
});

describe("resolve", () => {
  function createViewport(w: number, h: number): Node {
    const root = createNode({});
    root.rect = { x: 0, y: 0, w, h };
    return root;
  }

  it("positions leaf from right edge using intrinsic width", () => {
    const root = createViewport(320, 240);
    root.children = [createNode({ box: { right: 4 }, intrinsic: { w: 100, h: 16 } })];

    resolve(root);

    expect(root.children[0].rect).toEqual({ x: 216, y: 0, w: 100, h: 16 });
  });

  it("positions leaf from bottom edge using intrinsic height", () => {
    const root = createViewport(320, 240);
    root.children = [createNode({ box: { bottom: 8 }, intrinsic: { w: 100, h: 16 } })];

    resolve(root);

    expect(root.children[0].rect).toEqual({ x: 0, y: 216, w: 100, h: 16 });
  });

  it("positions leaf from both right and bottom edges", () => {
    const root = createViewport(320, 240);
    root.children = [createNode({ box: { right: 4, bottom: 8 }, intrinsic: { w: 100, h: 16 } })];

    resolve(root);

    expect(root.children[0].rect).toEqual({ x: 216, y: 216, w: 100, h: 16 });
  });

  it("fires onLayout only when rect changes", () => {
    const layouts: Rect[] = [];
    const leaf = createNode({
      box: { right: 4 },
      intrinsic: { w: 100, h: 16 },
      onLayout: (r) => {
        layouts.push({ ...r });
      },
    });
    const root = createViewport(320, 240);
    root.children = [leaf];

    // First resolve: NaN → placed rect, fires
    resolve(root);
    expect(layouts).toHaveLength(1);
    expect(layouts[0]).toEqual({ x: 216, y: 0, w: 100, h: 16 });

    // Change box and resolve again: rect changes, fires
    leaf.box.right = 10;
    resolve(root);
    expect(layouts).toHaveLength(2);
    expect(layouts[1]).toEqual({ x: 210, y: 0, w: 100, h: 16 });

    // Replace hook with throwing one and resolve: no change, does not fire
    leaf.onLayout = () => {
      throw new Error("should not fire");
    };
    resolve(root);
  });
});
