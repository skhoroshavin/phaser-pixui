import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

describe("measure", () => {
  function viewport(
    width: number,
    height: number,
    alignItems: "start" | "stretch" = "stretch",
  ): Node {
    return new Node({ layout: { width, height, alignItems } });
  }

  it("auto-sizes nested containers to a leaf's margin box, explicit size overriding intrinsic", () => {
    const root = viewport(320, 240, "start");
    const outer = new Node({ layout: { alignItems: "start" } });
    const inner = new Node({ layout: { marginX: 6, marginY: 3 } });
    // intrinsic on both axes; explicit width (50) overrides intrinsic w (30),
    // height falls back to intrinsic (40); per-axis margins
    const leaf = new Node({
      layout: { width: 50, marginX: 10, marginY: 5 },
      intrinsicSize: { width: 30, height: 40 },
    });
    inner.add(leaf);
    outer.add(inner);
    root.add(outer);

    resolve(root);

    // leaf margin box: x = 10+50+10 = 70, y = 5+40+5 = 50 → inner
    // inner margin box: x = 6+70+6 = 82, y = 3+50+3 = 56 → outer
    expect(outer.rect).toEqual({ x: 0, y: 0, width: 82, height: 56 });
    expect(inner.rect).toEqual({ x: 6, y: 3, width: 70, height: 50 });
    // leaf inset by inner's + its own margins; width overridden to 50, height intrinsic 40
    expect(leaf.rect).toEqual({ x: 16, y: 8, width: 50, height: 40 });
  });

  it("auto-sizes a flex container to its children's margin boxes", () => {
    const root = viewport(320, 240, "start");
    const flex = new Node({ layout: { direction: "column", gap: 4 } });
    const a = new Node({ layout: { width: 50, height: 30, margin: 10 } });
    const b = new Node({ layout: { width: 40, height: 20, margin: 10 } });
    flex.add(a, b);
    root.add(flex);

    resolve(root);

    // main (height): (30 + 10 + 10) + gap 4 + (20 + 10 + 10) = 94
    // cross (width): max(50 + 10 + 10, 40 + 10 + 10) = 70
    expect(flex.rect).toEqual({ x: 0, y: 0, width: 70, height: 94 });
  });

  it("caps the availableWidth by maxWidth", () => {
    const root = viewport(200, 200);
    root.add(
      new Node({
        layout: { width: 200, maxWidth: 80 },
        intrinsicSize: (aw) => ({ width: 0, height: aw ?? 0 }),
      }),
    );
    resolve(root);
    // maxWidth caps both the availableWidth (→ height 80) and the resolved width (→ 80)
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, width: 80, height: 80 });
  });

  it("passes the stretch width into a definite parent as availableWidth", () => {
    const root = viewport(200, 200);
    root.add(
      new Node({
        layout: { left: 0, right: 0 },
        intrinsicSize: (aw) => ({ width: 0, height: aw ?? 0 }),
      }),
    );
    resolve(root);
    // stretched to the parent's 200 width; availableWidth surfaces as height
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, width: 200, height: 200 });
  });

  it("passes the container's content width to a non-stretch child as availableWidth", () => {
    const root = viewport(200, 200, "start");
    root.add(
      new Node({
        layout: {},
        intrinsicSize: (aw) => ({ width: aw === 200 ? 50 : 0, height: 30 }),
      }),
    );
    resolve(root);
    // a non-stretch child is still measured against the container's content width (200);
    // its max-content (50) fits, so it stays on one line
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, width: 50, height: 30 });
  });

  it("wraps a non-stretch child to the container width instead of overflowing", () => {
    const root = viewport(320, 240);
    // left/right + marginX:auto => fit-content (no top-down width); maxWidth caps it
    const box = new Node({
      layout: { left: 0, right: 0, marginX: "auto", maxWidth: 100, alignItems: "center" },
    });
    box.add(
      new Node({
        intrinsicSize: (aw) =>
          aw !== undefined ? { width: aw, height: 60 } : { width: 150, height: 30 },
      }),
    );
    root.add(box);
    resolve(root);

    expect(box.rect.width).toBe(100);
    // wrapped to the 100 budget (height 60), not left as one 150-wide line (height 30)
    expect(box.children[0]!.rect.height).toBe(60);
  });

  it("flows a stretched leaf's wrapped height up to an auto-height parent", () => {
    const root = viewport(200, 200);
    const container = new Node({ layout: { width: 200 } }); // height auto
    container.add(
      new Node({
        intrinsicSize: (aw) => ({ width: 0, height: aw === 200 ? 40 : 0 }),
      }),
    );
    root.add(container);
    resolve(root);
    // container auto-heights to 40 only if the leaf closure saw the 200 stretch
    // width during the container's own measurement (aggregation threading)
    expect(container.rect).toEqual({ x: 0, y: 0, width: 200, height: 40 });
  });

  it("wraps stretched text at a maxWidth-capped container's width", () => {
    const root = viewport(320, 240);
    const frame = new Node({ layout: { left: 0, right: 0, maxWidth: 224 } });
    frame.add(
      new Node({
        intrinsicSize: (aw) => ({ width: 0, height: aw === 224 ? 48 : 16 }),
      }),
    );
    root.add(frame);
    resolve(root);
    expect(frame.rect.width).toBe(224);
    expect(frame.rect.height).toBe(48);
  });

  it("caps the width before auto-margin centering", () => {
    const root = viewport(320, 240);
    root.add(
      new Node({ layout: { left: 0, right: 0, width: 200, maxWidth: 80, marginX: "auto" } }),
    );
    resolve(root);
    // max-width caps width to 80 first, then auto margins center it: (320-80)/2 = 120
    expect(root.children[0]!.rect).toEqual({ x: 120, y: 0, width: 80, height: 0 });
  });

  it("shrink-wraps a parent to a child's maxWidth-capped size", () => {
    const root = viewport(320, 240, "start");
    const parent = new Node({ layout: {} }); // auto width
    const child = new Node({ layout: { width: 200, maxWidth: 100, height: 10 } });
    parent.add(child);
    root.add(parent);

    resolve(root);

    // measurement must respect maxWidth so the parent shrink-wraps to 100, not 200
    expect(parent.rect.width).toBe(100);
  });

  it("re-wraps a stretched flex item's width-dependent content in a definite-width column", () => {
    const root = viewport(400, 200);
    const col = new Node({ layout: { direction: "column", width: 100 } });
    // text that wraps taller (height:40) when given the stretched width 100,
    // otherwise a single line (height:20)
    const text = new Node({ intrinsicSize: (aw) => ({ width: 0, height: aw === 100 ? 40 : 20 }) });
    col.add(text);
    root.add(col);
    resolve(root);
    // the item is stretched to the column's 100 width, so its content must
    // re-wrap during measurement → height 40 flows up to the column
    expect(text.rect).toEqual({ x: 0, y: 0, width: 100, height: 40 });
    expect(col.rect).toEqual({ x: 0, y: 0, width: 100, height: 40 });
  });

  it("wraps stretched text at the margin-reduced content width, not the full edge-stretch width", () => {
    const root = viewport(200, 200);
    // stretched into a 200 container with left:0 right:0 and marginX:50:
    // content width = 200 - 0 - 0 - 50 - 50 = 100, so text must wrap at 100.
    root.add(
      new Node({
        layout: { left: 0, right: 0, marginX: 50 },
        intrinsicSize: (aw) => ({ width: 0, height: aw !== undefined && aw <= 100 ? 40 : 10 }),
      }),
    );
    resolve(root);
    // text wrapped at 100 (not 200) → height 40; rect width = 100, inset by the 50 margin
    expect(root.children[0]!.rect).toEqual({ x: 50, y: 0, width: 100, height: 40 });
  });
});
