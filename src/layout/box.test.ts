import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

describe("box", () => {
  it("uses explicit size, else intrinsic, when no edges set", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const explicit = new Node({
      layout: {
        width: 80,
        height: 50,
        paddingLeft: 4,
        paddingTop: 2,
        paddingRight: 6,
        paddingBottom: 3,
      },
      intrinsicSize: { w: 100, h: 16 },
    });
    const intrinsic = new Node({
      layout: { paddingLeft: 4, paddingTop: 2, paddingRight: 6, paddingBottom: 3 },
      intrinsicSize: { w: 80, h: 20 },
    });
    root.add(explicit, intrinsic);
    resolve(root);
    // explicit size overrides intrinsic (100×16 → 80×50)
    expect(explicit.rect).toEqual({ x: 0, y: 0, w: 80, h: 50 });
    // no explicit size → intrinsic fills; intrinsic dominates the padding box
    expect(intrinsic.rect).toEqual({ x: 0, y: 0, w: 80, h: 20 });
  });

  it("auto-sized container stays at intrinsic; padding insets content within (nine-slice frame)", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    // a frame backed by a 200×60 image, with padding from its nine-slice slices
    const frame = new Node({
      layout: { paddingLeft: 20, paddingTop: 15, paddingRight: 20, paddingBottom: 15 },
      intrinsicSize: { w: 200, h: 60 },
    });
    const label = new Node({ layout: { width: 100, height: 16 } });
    frame.add(label);
    root.add(frame);
    resolve(root);

    // frame sizes to its image, not image + padding (padding is carved out of it)
    expect(frame.rect).toEqual({ x: 0, y: 0, w: 200, h: 60 });
    // label resolves against the content rect (200-20-20 × 60-15-15), at its origin
    expect(label.rect).toEqual({ x: 20, y: 15, w: 100, h: 16 });
  });

  it("positions by content edge with intrinsic size", () => {
    const root = new Node({
      layout: {
        width: 320,
        height: 240,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const start = new Node({ layout: { left: 10, top: 20 }, intrinsicSize: { w: 100, h: 16 } });
    const end = new Node({ layout: { right: 4, bottom: 8 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(start, end);
    resolve(root);
    // content rect: x=10, y=20, w=280, h=180
    // start edges: offset from content origin (10+10, 20+20)
    expect(start.rect).toEqual({ x: 20, y: 40, w: 100, h: 16 });
    // end edges: anchored to content extent (10 + 280-4-100, 20 + 180-8-16)
    expect(end.rect).toEqual({ x: 186, y: 176, w: 100, h: 16 });
  });

  it("positions by content start edge with explicit size", () => {
    const root = new Node({
      layout: {
        width: 320,
        height: 240,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const horiz = new Node({ layout: { left: 10, width: 80 }, intrinsicSize: { w: 100, h: 16 } });
    const vert = new Node({ layout: { top: 20, height: 50 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(horiz, vert);
    resolve(root);
    // content rect: x=10, y=20, w=280, h=180
    // start edge from content origin (10+10, 20+20); the unanchored axis falls at the content origin
    expect(horiz.rect).toEqual({ x: 20, y: 20, w: 80, h: 16 });
    expect(vert.rect).toEqual({ x: 10, y: 40, w: 100, h: 50 });
  });

  it("positions by content end edge with explicit size", () => {
    const root = new Node({
      layout: {
        width: 320,
        height: 240,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const horiz = new Node({ layout: { right: 4, width: 200 }, intrinsicSize: { w: 100, h: 16 } });
    const vert = new Node({ layout: { bottom: 8, height: 50 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(horiz, vert);
    resolve(root);
    // end edge anchored to content extent: x = 10 + 280-4-200, y = 20 + 180-8-50
    expect(horiz.rect).toEqual({ x: 86, y: 20, w: 200, h: 16 });
    expect(vert.rect).toEqual({ x: 10, y: 142, w: 100, h: 50 });
  });

  it("stretches between content start and end edges, overtaking intrinsic size", () => {
    const root = new Node({
      layout: {
        width: 320,
        height: 240,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const horiz = new Node({ layout: { left: 10, right: 20 }, intrinsicSize: { w: 100, h: 16 } });
    const vert = new Node({ layout: { top: 10, bottom: 20 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(horiz, vert);
    resolve(root);
    // content rect: x=10, y=20, w=280, h=180
    // horizontal: width stretches (intrinsic 100 → 250), height stays intrinsic; x from content origin (10+10)
    expect(horiz.rect).toEqual({ x: 20, y: 20, w: 250, h: 16 });
    // vertical: height stretches (intrinsic 16 → 150), width stays intrinsic; y from content origin (20+10)
    expect(vert.rect).toEqual({ x: 10, y: 30, w: 100, h: 150 });
  });

  it("ignores far edge and uses explicit size when overconstrained", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const horiz = new Node({ layout: { left: 10, right: 20, width: 100 } });
    const vert = new Node({ layout: { top: 10, bottom: 20, height: 50 } });
    root.add(horiz, vert);
    resolve(root);
    // start edge + explicit size honored; end edge ignored (would stretch to 290 / 210)
    expect(horiz.rect).toEqual({ x: 10, y: 0, w: 100, h: 0 });
    expect(vert.rect).toEqual({ x: 0, y: 10, w: 0, h: 50 });
  });

  it("applies margins from the edge", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const start = new Node({
      layout: { left: 10, top: 10, marginLeft: 5, marginTop: 8, width: 80, height: 40 },
    });
    const end = new Node({
      layout: { right: 20, bottom: 15, marginRight: 6, marginBottom: 4, width: 80, height: 40 },
    });
    root.add(start, end);
    resolve(root);
    // start edge: left + marginLeft = 15, top + marginTop = 18
    expect(start.rect).toEqual({ x: 15, y: 18, w: 80, h: 40 });
    // end edge: 320 - right - marginRight - width = 214, 240 - bottom - marginBottom - height = 181
    expect(end.rect).toEqual({ x: 214, y: 181, w: 80, h: 40 });
  });

  it("centers with auto margins inside content rect when both edges are set, ignored otherwise", () => {
    const root = new Node({
      layout: {
        width: 320,
        height: 240,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    // centers on x (both h-edges), auto ignored on y (single v-edge)
    const a = new Node({
      layout: { left: 0, right: 0, width: 80, height: 40, top: 50, margin: "auto" },
    });
    // centers on y (both v-edges), auto ignored on x (single h-edge)
    const b = new Node({
      layout: { top: 0, bottom: 0, width: 80, height: 40, left: 60, margin: "auto" },
    });
    root.add(a, b);
    resolve(root);
    // content rect: x=10, y=20, w=280, h=180
    // a: x centered in content (10 + (280-80)/2 = 110), y positioned by top (auto ignored, 20+50)
    expect(a.rect).toEqual({ x: 110, y: 70, w: 80, h: 40 });
    // b: y centered in content (20 + (180-40)/2 = 90), x positioned by left (auto ignored, 10+60)
    expect(b.rect).toEqual({ x: 70, y: 90, w: 80, h: 40 });
  });
});
