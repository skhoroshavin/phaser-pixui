import { describe, expect, it } from "vitest";
import { createNode, resolve, type Node, type Rect } from "./";

describe("resolve", () => {
  function viewport(w: number, h: number): Node {
    return createNode({ box: { width: w, height: h } });
  }

  // ── nested children ──

  it("positions nested child at parent origin when no edges set", () => {
    const root = viewport(320, 240);
    const frame = createNode({ box: { left: 100, top: 50, width: 200, height: 100 } });
    const child = createNode({ box: { width: 50 }, intrinsic: { w: 50, h: 20 } });
    frame.children = [child];
    root.children = [frame];

    resolve(root);

    expect(frame.rect).toEqual({ x: 100, y: 50, w: 200, h: 100 });
    expect(child.rect).toEqual({ x: 100, y: 50, w: 50, h: 20 });
  });

  it("positions nested child with left/top offset relative to parent", () => {
    const root = viewport(320, 240);
    const frame = createNode({ box: { left: 50, top: 30, width: 200, height: 100 } });
    const child = createNode({ box: { left: 10, top: 20, width: 80 } });
    frame.children = [child];
    root.children = [frame];

    resolve(root);

    expect(frame.rect).toEqual({ x: 50, y: 30, w: 200, h: 100 });
    expect(child.rect).toEqual({ x: 60, y: 50, w: 80, h: 0 });
  });

  it("positions nested child with right/bottom relative to parent", () => {
    const root = viewport(320, 240);
    const frame = createNode({ box: { left: 50, top: 30, width: 200, height: 100 } });
    const child = createNode({ box: { right: 10, bottom: 20, width: 50, height: 30 } });
    frame.children = [child];
    root.children = [frame];

    resolve(root);

    expect(frame.rect).toEqual({ x: 50, y: 30, w: 200, h: 100 });
    expect(child.rect).toEqual({ x: 190, y: 80, w: 50, h: 30 });
  });

  // ── onLayout ──

  it("fires onLayout only when rect changes", () => {
    const layouts: Rect[] = [];
    const leaf = createNode({
      box: { right: 4 },
      intrinsic: { w: 100, h: 16 },
      onLayout: (r) => {
        layouts.push({ ...r });
      },
    });
    const root = viewport(320, 240);
    root.children = [leaf];

    resolve(root);
    expect(layouts).toHaveLength(1);
    expect(layouts[0]).toEqual({ x: 216, y: 0, w: 100, h: 16 });

    leaf.box.right = 10;
    resolve(root);
    expect(layouts).toHaveLength(2);
    expect(layouts[1]).toEqual({ x: 210, y: 0, w: 100, h: 16 });

    leaf.onLayout = () => {
      throw new Error("should not fire");
    };
    resolve(root);
  });
});
