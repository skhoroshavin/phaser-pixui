import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

// Intentional deviations from CSS layout. These tests pin behavior that deliberately
// differs from the standard and exists to make the deviations discoverable in one place.
//
// 1. No explicit `display` or `position` properties — both are inferred.
// 2. `display` defaults to block; setting `direction` switches it to flex.
// 3. `position` is absolute when the parent is block, or when any of
//    left/right/top/bottom is set; otherwise (no edges, flex parent) the
//    item is in flex flow.
// 4. No flex wrapping — items overflow rather than wrap.
// 5. Absolutely positioned items contribute to an auto-sized container's
//    intrinsic size (block or flex parent).
// 6. Padding carves the content rect out of the `intrinsic` size rather than
//    adding to it. When padding exceeds the intrinsic size, the padding box
//    still wins.

describe("deviations", () => {
  it("positions block children absolutely by default — no flow stacking", () => {
    const root = new Node({ layout: { width: 200, height: 200 } });
    const a = new Node({ layout: { width: 80, height: 40 } });
    const b = new Node({ layout: { width: 50, height: 30 } });
    root.add(a, b);
    resolve(root);

    // CSS block flow would stack: a at y=0, b at y=40. Both at origin instead.
    expect(a.rect).toEqual({ x: 0, y: 0, width: 80, height: 40 });
    expect(b.rect).toEqual({ x: 0, y: 0, width: 50, height: 30 });
  });

  it("flows flex children without explicit edges along the main axis", () => {
    const root = new Node({ layout: { width: 200, height: 200, direction: "column" } });
    const a = new Node({ layout: { width: 80, height: 40 } });
    const b = new Node({ layout: { width: 50, height: 30 } });
    root.add(a, b);
    resolve(root);

    expect(a.rect).toEqual({ x: 0, y: 0, width: 80, height: 40 });
    expect(b.rect).toEqual({ x: 0, y: 40, width: 50, height: 30 });
  });

  it("a flex child with a positional edge is taken out of flow", () => {
    const root = new Node({ layout: { width: 200, height: 200, direction: "column" } });
    const a = new Node({ layout: { width: 80, height: 40 } });
    const b = new Node({ layout: { top: 30, width: 50, height: 30 } });
    const c = new Node({ layout: { width: 60, height: 20 } });
    root.add(a, b, c);
    resolve(root);

    // a flows from origin, c flows right after a — b is skipped
    expect(a.rect).toEqual({ x: 0, y: 0, width: 80, height: 40 });
    expect(b.rect).toEqual({ x: 0, y: 30, width: 50, height: 30 });
    expect(c.rect).toEqual({ x: 0, y: 40, width: 60, height: 20 });
  });

  it("flown flex children that exceed a fixed container overflow on one line", () => {
    const root = new Node({ layout: { width: 200, height: 200 } });
    const flex = new Node({ layout: { width: 100, height: 50, direction: "row" } });
    const a = new Node({ layout: { width: 80, height: 30 } });
    const b = new Node({ layout: { width: 80, height: 30 } });
    flex.add(a, b);
    root.add(flex);
    resolve(root);

    // items keep their explicit sizes and overflow past the container edge
    // rather than shrinking to fit — pixel-art sizes must be honored exactly
    expect(a.rect).toEqual({ x: 0, y: 0, width: 80, height: 30 });
    expect(b.rect).toEqual({ x: 80, y: 0, width: 80, height: 30 });
  });

  it("auto-sized block container wraps absolute children anchored by either edge", () => {
    const root = new Node({ layout: { width: 200, height: 200 } });
    const container = new Node({ layout: {} });
    const a = new Node({ layout: { left: 5, top: 8, width: 30, height: 20 } });
    const b = new Node({ layout: { right: 10, bottom: 15, width: 50, height: 40 } });
    container.add(a, b);
    root.add(container);
    resolve(root);

    // a start-anchored resolves at its edges
    expect(a.rect).toEqual({ x: 5, y: 8, width: 30, height: 20 });
    // b end-anchored resolves against the sized container
    expect(b.rect).toEqual({ x: 0, y: 0, width: 50, height: 40 });
    // container wraps both: width = max(5+30, 10+50) = 60, height = max(8+20, 15+40) = 55
    expect(container.rect).toEqual({ x: 0, y: 0, width: 60, height: 55 });
  });

  it("auto-sized flex container wraps start- and end-anchored absolute items alongside flow items", () => {
    const root = new Node({ layout: { width: 200, height: 200 } });
    const flex = new Node({ layout: { direction: "column" } });
    const a = new Node({ layout: { width: 30, height: 20 } });
    const b = new Node({ layout: { width: 40, height: 25 } });
    const absStart = new Node({ layout: { top: 5, left: 8, width: 30, height: 30 } });
    const absEnd = new Node({ layout: { right: 10, bottom: 15, width: 50, height: 50 } });
    flex.add(a, b, absStart, absEnd);
    root.add(flex);
    resolve(root);

    // flow items stack normally on the main axis, unaffected by absolutes
    expect(a.rect).toEqual({ x: 0, y: 0, width: 30, height: 20 });
    expect(b.rect).toEqual({ x: 0, y: 20, width: 40, height: 25 });
    // start-anchored absolute resolves at its edges
    expect(absStart.rect).toEqual({ x: 8, y: 5, width: 30, height: 30 });
    // end-anchored absolute resolves against the sized container
    expect(absEnd.rect).toEqual({ x: 0, y: 0, width: 50, height: 50 });
    // container wraps all sources: flow stack (main 45), start-anchored
    // (main 5+30=35, cross 8+30=38), end-anchored (main 50+15=65, cross 50+10=60)
    expect(flex.rect).toEqual({ x: 0, y: 0, width: 60, height: 65 });
  });

  it("padding carves content out of intrinsic, or wins if larger", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    // intrinsic larger than its padding box → element sizes to intrinsic
    const frame = new Node({
      layout: { paddingLeft: 20, paddingTop: 15, paddingRight: 20, paddingBottom: 15 },
      intrinsicSize: { width: 200, height: 60 },
    });
    // intrinsic smaller than its padding box → padding box wins
    const icon = new Node({
      layout: { paddingLeft: 20, paddingTop: 20, paddingRight: 20, paddingBottom: 20 },
      intrinsicSize: { width: 8, height: 8 },
    });
    root.add(frame, icon);
    resolve(root);

    // CSS content-box would inflate to 240×90; intrinsic is the border box instead
    expect(frame.rect).toEqual({ x: 0, y: 0, width: 200, height: 60 });
    // max(8, 20+0+20) = 40 — padding box exceeds intrinsic and wins
    expect(icon.rect).toEqual({ x: 0, y: 0, width: 40, height: 40 });
  });
});
