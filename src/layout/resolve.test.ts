import { describe, expect, it } from "vitest";
import { Node, resolve, type Rect } from "./";

describe("resolve", () => {
  function viewport(width: number, height: number): Node {
    return new Node({ layout: { width, height } });
  }

  // ── nested children ──

  it("positions nested child with left/top offset relative to parent", () => {
    const root = viewport(320, 240);
    const frame = new Node({ layout: { left: 50, top: 30, width: 200, height: 100 } });
    const child = new Node({ layout: { left: 10, top: 20, width: 80 } });
    frame.add(child);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 50, y: 30, width: 200, height: 100 });
    expect(child.rect).toEqual({ x: 60, y: 50, width: 80, height: 0 });
  });

  it("positions nested child with right/bottom relative to parent", () => {
    const root = viewport(320, 240);
    const frame = new Node({ layout: { left: 50, top: 30, width: 200, height: 100 } });
    const child = new Node({ layout: { right: 10, bottom: 20, width: 50, height: 30 } });
    frame.add(child);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 50, y: 30, width: 200, height: 100 });
    expect(child.rect).toEqual({ x: 190, y: 80, width: 50, height: 30 });
  });

  // ── onLayout ──

  it("fires onLayout only when rect changes", () => {
    const layouts: Rect[] = [];
    const leaf = new Node({
      layout: { right: 4 },
      intrinsicSize: { width: 100, height: 16 },
      onLayout: (r) => {
        layouts.push({ ...r });
      },
    });
    const root = viewport(320, 240);
    root.add(leaf);

    resolve(root);
    expect(layouts).toHaveLength(1);
    expect(layouts[0]).toEqual({ x: 216, y: 0, width: 100, height: 16 });

    // Viewport resize repositions the right-anchored leaf.
    root.layout.width = 400;
    resolve(root);
    expect(layouts).toHaveLength(2);
    expect(layouts[1]).toEqual({ x: 296, y: 0, width: 100, height: 16 });

    leaf.onLayout = () => {
      throw new Error("should not fire");
    };
    resolve(root);
  });

  // ── per-axis intrinsic (e.g. auto-sized Frame from sprite dims) ──

  it("treats an omitted intrinsic axis as 0", () => {
    const frame = new Node({ intrinsicSize: { height: 40 } });
    const root = new Node({ layout: { width: 320, height: 240, alignItems: "start" } });
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 0, y: 0, width: 0, height: 40 });
  });
});
