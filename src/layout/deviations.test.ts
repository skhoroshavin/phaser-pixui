import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

// Intentional deviations from CSS layout. These tests pin behavior that deliberately
// differs from the standard and exists to make the deviations discoverable in one place.
//
// 1. No `display` property — display is always flex; `direction` defaults to `column`.
// 2. No `position` property — items are in flex flow by default, and absolute when any
//    of left/right/top/bottom is set.
// 3. No flex wrapping — items overflow rather than wrap.
// 4. An auto-sized node cannot be smaller than its `intrinsic`.
// 5. Padding carves the content rect out of the `intrinsic` size rather than adding
//    to it. When padding exceeds the intrinsic size, the padding box still wins.
// 6. An auto-sized element with both edges and an auto margin uses fit-content size,
//    so the margin can center or offset it instead of stretching.

describe("deviations", () => {
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

  it("flown children that exceed a fixed container overflow on one line", () => {
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

  it("an auto-sized flex container cannot be smaller than its intrinsic", () => {
    const root = new Node({ layout: { width: 320, height: 240, alignItems: "start" } });
    // intrinsic larger than its flex children → container stays at intrinsic
    const flex = new Node({
      layout: { direction: "column" },
      intrinsicSize: { width: 200, height: 60 },
    });
    flex.add(new Node({ layout: { width: 30, height: 20 } }));
    root.add(flex);
    resolve(root);

    // max(200, 30) = 200, max(60, 20) = 60 — intrinsic floors the flex path too
    expect(flex.rect).toEqual({ x: 0, y: 0, width: 200, height: 60 });
  });

  it("padding carves content out of intrinsic, or wins if larger", () => {
    const root = new Node({ layout: { width: 320, height: 240, alignItems: "start" } });
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
    expect(icon.rect).toEqual({ x: 0, y: 60, width: 40, height: 40 });
  });

  it("auto-width with both edges and an auto margin fits to content, centering or offsetting", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const centered = new Node({
      layout: { left: 0, right: 0, marginX: "auto" },
      intrinsicSize: { width: 50, height: 10 },
    });
    const pushedEnd = new Node({
      layout: { left: 0, right: 0, marginLeft: "auto" },
      intrinsicSize: { width: 50, height: 10 },
    });
    root.add(centered, pushedEnd);
    resolve(root);

    // both margins auto: content-sized (50) and centered → (320-50)/2 = 135
    expect(centered.rect).toEqual({ x: 135, y: 0, width: 50, height: 10 });
    // single start margin auto: absorbs all free space, pushing to the end edge → 320-50 = 270
    expect(pushedEnd.rect).toEqual({ x: 270, y: 0, width: 50, height: 10 });
    // availableRect spans the x edge box (intrinsic size); y pinned (no edges)
    expect(centered.availableRect).toEqual({ x: 0, y: 0, width: 320, height: 10 });
    expect(pushedEnd.availableRect).toEqual({ x: 0, y: 0, width: 320, height: 10 });
  });
});
