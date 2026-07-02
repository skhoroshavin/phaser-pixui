import { describe, expect, it } from "vitest";
import { Node, resolve, type Rect } from "./";

describe("resolve", () => {
  function viewport(w: number, h: number): Node {
    return new Node({ layout: { width: w, height: h } });
  }

  // ── nested children ──

  it("positions nested child at parent origin when no edges set", () => {
    const root = viewport(320, 240);
    const frame = new Node({ layout: { left: 100, top: 50, width: 200, height: 100 } });
    const child = new Node({ layout: { width: 50 }, intrinsicSize: { w: 50, h: 20 } });
    frame.add(child);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 100, y: 50, w: 200, h: 100 });
    expect(child.rect).toEqual({ x: 100, y: 50, w: 50, h: 20 });
  });

  it("positions nested child with left/top offset relative to parent", () => {
    const root = viewport(320, 240);
    const frame = new Node({ layout: { left: 50, top: 30, width: 200, height: 100 } });
    const child = new Node({ layout: { left: 10, top: 20, width: 80 } });
    frame.add(child);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 50, y: 30, w: 200, h: 100 });
    expect(child.rect).toEqual({ x: 60, y: 50, w: 80, h: 0 });
  });

  it("positions nested child with right/bottom relative to parent", () => {
    const root = viewport(320, 240);
    const frame = new Node({ layout: { left: 50, top: 30, width: 200, height: 100 } });
    const child = new Node({ layout: { right: 10, bottom: 20, width: 50, height: 30 } });
    frame.add(child);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 50, y: 30, w: 200, h: 100 });
    expect(child.rect).toEqual({ x: 190, y: 80, w: 50, h: 30 });
  });

  // ── onLayout ──

  it("fires onLayout only when rect changes", () => {
    const layouts: Rect[] = [];
    const leaf = new Node({
      layout: { right: 4 },
      intrinsicSize: { w: 100, h: 16 },
      onLayout: (r) => {
        layouts.push({ ...r });
      },
    });
    const root = viewport(320, 240);
    root.add(leaf);

    resolve(root);
    expect(layouts).toHaveLength(1);
    expect(layouts[0]).toEqual({ x: 216, y: 0, w: 100, h: 16 });

    // Viewport resize repositions the right-anchored leaf.
    root.layout.width = 400;
    resolve(root);
    expect(layouts).toHaveLength(2);
    expect(layouts[1]).toEqual({ x: 296, y: 0, w: 100, h: 16 });

    leaf.onLayout = () => {
      throw new Error("should not fire");
    };
    resolve(root);
  });

  // ── per-axis intrinsic (e.g. auto-sized Frame from sprite dims) ──

  it("treats an omitted intrinsic axis as 0", () => {
    const frame = new Node({ intrinsicSize: { h: 40 } });
    const root = viewport(320, 240);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 0, y: 0, w: 0, h: 40 });
  });

  it("lets explicit width override an omitted intrinsic axis", () => {
    const frame = new Node({ layout: { width: 100 }, intrinsicSize: { h: 40 } });
    const root = viewport(320, 240);
    root.add(frame);

    resolve(root);

    expect(frame.rect).toEqual({ x: 0, y: 0, w: 100, h: 40 });
  });
});
