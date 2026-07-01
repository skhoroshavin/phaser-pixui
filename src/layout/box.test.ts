import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

describe("box", () => {
  function viewport(w: number, h: number): Node {
    return new Node({ layout: { width: w, height: h } });
  }

  it("uses explicit size, else intrinsic, when no edges set", () => {
    const root = viewport(320, 240);
    const explicit = new Node({
      layout: { width: 80, height: 50 },
      intrinsicSize: { w: 100, h: 16 },
    });
    const intrinsic = new Node({
      layout: {},
      intrinsicSize: { w: 80, h: 20 },
    });
    root.add(explicit, intrinsic);
    resolve(root);
    // explicit size overrides intrinsic (100×16 → 80×50)
    expect(explicit.rect).toEqual({ x: 0, y: 0, w: 80, h: 50 });
    // no explicit size → intrinsic fills
    expect(intrinsic.rect).toEqual({ x: 0, y: 0, w: 80, h: 20 });
  });

  it("positions by edge with intrinsic size", () => {
    const root = viewport(320, 240);
    const start = new Node({ layout: { left: 10, top: 20 }, intrinsicSize: { w: 100, h: 16 } });
    const end = new Node({ layout: { right: 4, bottom: 8 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(start, end);
    resolve(root);
    // start edges (left/top)
    expect(start.rect).toEqual({ x: 10, y: 20, w: 100, h: 16 });
    // end edges (right/bottom)
    expect(end.rect).toEqual({ x: 216, y: 216, w: 100, h: 16 });
  });

  it("positions by start edge with explicit size", () => {
    const root = viewport(320, 240);
    const horiz = new Node({ layout: { left: 10, width: 80 }, intrinsicSize: { w: 100, h: 16 } });
    const vert = new Node({ layout: { top: 20, height: 50 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(horiz, vert);
    resolve(root);
    expect(horiz.rect).toEqual({ x: 10, y: 0, w: 80, h: 16 });
    expect(vert.rect).toEqual({ x: 0, y: 20, w: 100, h: 50 });
  });

  it("positions by end edge with explicit size", () => {
    const root = viewport(320, 240);
    const horiz = new Node({ layout: { right: 4, width: 200 }, intrinsicSize: { w: 100, h: 16 } });
    const vert = new Node({ layout: { bottom: 8, height: 50 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(horiz, vert);
    resolve(root);
    expect(horiz.rect).toEqual({ x: 116, y: 0, w: 200, h: 16 });
    expect(vert.rect).toEqual({ x: 0, y: 182, w: 100, h: 50 });
  });

  it("stretches between start and end edges, overtaking intrinsic size", () => {
    const root = viewport(320, 240);
    const horiz = new Node({ layout: { left: 10, right: 20 }, intrinsicSize: { w: 100, h: 16 } });
    const vert = new Node({ layout: { top: 10, bottom: 20 }, intrinsicSize: { w: 100, h: 16 } });
    root.add(horiz, vert);
    resolve(root);
    // horizontal: width stretches (intrinsic 100 → 290), height stays intrinsic
    expect(horiz.rect).toEqual({ x: 10, y: 0, w: 290, h: 16 });
    // vertical: height stretches (intrinsic 16 → 210), width stays intrinsic
    expect(vert.rect).toEqual({ x: 0, y: 10, w: 100, h: 210 });
  });

  it("ignores far edge and uses explicit size when overconstrained", () => {
    const root = viewport(320, 240);
    const horiz = new Node({ layout: { left: 10, right: 20, width: 100 } });
    const vert = new Node({ layout: { top: 10, bottom: 20, height: 50 } });
    root.add(horiz, vert);
    resolve(root);
    // start edge + explicit size honored; end edge ignored (would stretch to 290 / 210)
    expect(horiz.rect).toEqual({ x: 10, y: 0, w: 100, h: 0 });
    expect(vert.rect).toEqual({ x: 0, y: 10, w: 0, h: 50 });
  });

  it("applies margins from the edge", () => {
    const root = viewport(320, 240);
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

  it("centers with auto margins when both edges are set, ignored otherwise", () => {
    const root = viewport(320, 240);
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
    // a: x centered (320-80)/2 = 120, y positioned by top (auto ignored)
    expect(a.rect).toEqual({ x: 120, y: 50, w: 80, h: 40 });
    // b: y centered (240-40)/2 = 100, x positioned by left (auto ignored)
    expect(b.rect).toEqual({ x: 60, y: 100, w: 80, h: 40 });
  });
});
