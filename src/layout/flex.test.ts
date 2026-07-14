import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

describe("flex", () => {
  it("flows children vertically by default (column), filling the cross axis", () => {
    const root = new Node({ layout: { width: 200, height: 200 } });
    const a = new Node({ layout: { height: 40 } }); // width auto → fills
    const b = new Node({ layout: { width: 50, height: 30 } });
    root.add(a, b);
    resolve(root);

    // no direction set: defaults to column (CSS block-flow-like) — a stacks at origin
    // and stretches to 200 (cross axis), b stacks below at y=40 keeping its explicit width
    expect(a.rect).toEqual({ x: 0, y: 0, width: 200, height: 40 });
    expect(b.rect).toEqual({ x: 0, y: 40, width: 50, height: 30 });
    // a first (pinned), b last (mobile into trailing free space)
    expect(a.availableRect).toEqual({ x: 0, y: 0, width: 200, height: 40 });
    expect(b.availableRect).toEqual({ x: 0, y: 40, width: 200, height: 160 });
  });

  it("places children along the main axis with gap (column and row)", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const col = new Node({
      layout: { top: 0, width: 200, height: 58, direction: "column", gap: 8 },
    });
    const row = new Node({
      layout: { top: 100, width: 188, height: 30, direction: "row", gap: 8 },
    });
    const c1 = new Node({ layout: { width: 100, height: 30 } });
    const c2 = new Node({ layout: { width: 80, height: 20 } });
    const r1 = new Node({ layout: { width: 100, height: 30 } });
    const r2 = new Node({ layout: { width: 80, height: 20 } });
    col.add(c1, c2);
    row.add(r1, r2);
    root.add(col, row);
    resolve(root);

    // column: second child offset by first's height + gap
    expect(c1.rect).toEqual({ x: 0, y: 0, width: 100, height: 30 });
    expect(c2.rect).toEqual({ x: 0, y: 38, width: 80, height: 20 });
    // row: second child offset by first's width + gap
    expect(r1.rect).toEqual({ x: 0, y: 100, width: 100, height: 30 });
    expect(r2.rect).toEqual({ x: 108, y: 100, width: 80, height: 20 });
  });

  it("auto-sizes to wrap children on both directions (column and row)", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const col = new Node({
      layout: {
        top: 0,
        direction: "column",
        gap: 4,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const row = new Node({
      layout: {
        top: 100,
        direction: "row",
        gap: 4,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const c1 = new Node({ layout: { width: 100, height: 30 } });
    const c2 = new Node({ layout: { width: 80, height: 20 } });
    const r1 = new Node({ layout: { width: 100, height: 30 } });
    const r2 = new Node({ layout: { width: 80, height: 20 } });
    col.add(c1, c2);
    row.add(r1, r2);
    root.add(col, row);
    resolve(root);

    // column wraps to max child width × (sum heights + gap), plus content padding
    // cross width = padL + max(100) + padR = 140; main height = padT + (30+4+20) + padB = 114
    expect(col.rect).toEqual({ x: 0, y: 0, width: 140, height: 114 });
    expect(c2.rect).toEqual({ x: 10, y: 54, width: 80, height: 20 });
    // row wraps to (sum widths + gap) × max child height, plus content padding
    // main width = padL + (100+4+80) + padR = 224; cross height = padT + max(30) + padB = 90
    expect(row.rect).toEqual({ x: 0, y: 100, width: 224, height: 90 });
    expect(r2.rect).toEqual({ x: 114, y: 120, width: 80, height: 20 });
  });

  it("centers children on cross-axis when alignItems is center", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        alignItems: "center",
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const child1 = new Node({ layout: { width: 80, height: 30 } });
    const child2 = new Node({ layout: { width: 60, height: 20 } });
    flex.add(child1, child2);
    root.add(flex);

    resolve(root);

    // content rect: x=10, y=20, w=160, h=40
    // cross-axis: width 80 centered in content → x = 10 + floor((160-80)/2) = 50
    // cross-axis: width 60 centered in content → x = 10 + floor((160-60)/2) = 60
    // main-axis: gap 8 → child2.y = 20 + 30 + 8 = 58
    expect(child1.rect).toEqual({ x: 50, y: 20, width: 80, height: 30 });
    expect(child2.rect).toEqual({ x: 60, y: 58, width: 60, height: 20 });
    // cross-axis available space spans the content box (x 10..170); main: child1
    // (first) pinned, child2 (last) bounded by the overflowing content end (height 2)
    expect(child1.availableRect).toEqual({ x: 10, y: 20, width: 160, height: 30 });
    expect(child2.availableRect).toEqual({ x: 10, y: 58, width: 160, height: 2 });
  });

  it("aligns children to cross-axis end when alignItems is end", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        alignItems: "end",
      },
    });
    const child1 = new Node({ layout: { width: 80, height: 30 } });
    const child2 = new Node({ layout: { width: 60, height: 20 } });
    flex.add(child1, child2);
    root.add(flex);

    resolve(root);

    // cross-axis: width 80 in 200 → x = 200 - 80 = 120
    // cross-axis: width 60 in 200 → x = 200 - 60 = 140
    // main-axis: gap 8 → child2.y = 0 + 30 + 8 = 38
    expect(child1.rect).toEqual({ x: 120, y: 0, width: 80, height: 30 });
    expect(child2.rect).toEqual({ x: 140, y: 38, width: 60, height: 20 });
    // cross-axis available space spans the content box (availableRect.x=0 ≠ rect.x,
    // end-aligned); main: child1 (first) pinned, child2 (last) mobile into trailing free
    expect(child1.availableRect).toEqual({ x: 0, y: 0, width: 200, height: 30 });
    expect(child2.availableRect).toEqual({ x: 0, y: 38, width: 200, height: 62 });
  });

  it("centers packed children on main-axis when justifyContent is center", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        justifyContent: "center",
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 10,
      },
    });
    const child1 = new Node({ layout: { width: 80, height: 30 } });
    const child2 = new Node({ layout: { width: 60, height: 20 } });
    flex.add(child1, child2);
    root.add(flex);

    resolve(root);

    // content main rect: y=20, h=70 (200×100 minus padding)
    // packed = 30 + 8 + 20 = 58; free in 70 → 12; lead = floor(12/2) = 6; child1.y = 20 + 6 = 26
    // cross (explicit widths) anchored to content origin x=10
    expect(child1.rect).toEqual({ x: 10, y: 26, width: 80, height: 30 });
    expect(child2.rect).toEqual({ x: 10, y: 64, width: 60, height: 20 });
  });

  it("aligns packed children to main-axis end when justifyContent is end", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        gap: 8,
        justifyContent: "end",
      },
    });
    const child1 = new Node({ layout: { width: 80, height: 30 } });
    const child2 = new Node({ layout: { width: 60, height: 20 } });
    flex.add(child1, child2);
    root.add(flex);

    resolve(root);

    // packed = 30 + 8 + 20 = 58; free in 100 → 42; lead = full free space
    expect(child1.rect).toEqual({ x: 0, y: 42, width: 80, height: 30 });
    expect(child2.rect).toEqual({ x: 0, y: 80, width: 60, height: 20 });
    // child1 first (mobile), child2 last (pinned); child1 height 72 (=its own end),
    // NOT 80 (=child2.start) ⇒ the 8px gap is not movable space
    expect(child1.availableRect).toEqual({ x: 0, y: 0, width: 200, height: 72 });
    expect(child2.availableRect).toEqual({ x: 0, y: 80, width: 200, height: 20 });
  });

  it("stacks flex children with nested intrinsic sizes", () => {
    const root = new Node({ layout: { width: 320, height: 240, alignItems: "start" } });
    const flex = new Node({
      layout: { direction: "column", gap: 4 },
    });
    const wrapA = new Node({});
    const leafA = new Node({
      layout: { width: 80 },
      intrinsicSize: { height: 20 },
    });
    wrapA.add(leafA);
    const wrapB = new Node({});
    const leafB = new Node({
      layout: { width: 60 },
      intrinsicSize: { height: 15 },
    });
    wrapB.add(leafB);

    flex.add(wrapA, wrapB);
    root.add(flex);

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, width: 80, height: 39 });
    expect(wrapA.rect).toEqual({ x: 0, y: 0, width: 80, height: 20 });
    // CSS default align-items is stretch: wrapB's auto width fills the line (80),
    // even though its content (leafB) is only 60 wide.
    expect(wrapB.rect).toEqual({ x: 0, y: 24, width: 80, height: 15 });
  });

  it("lays out a flex container nested inside a flex container", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const outer = new Node({ layout: { direction: "column" } });
    const inner = new Node({ layout: { direction: "row", gap: 4 } });
    const a = new Node({ layout: { width: 40, height: 10 } });
    const b = new Node({ layout: { width: 40, height: 10 } });
    inner.add(a, b);
    outer.add(inner);
    root.add(outer);

    resolve(root);

    // inner is a row → a and b placed side by side (b.x = 40 + gap 4)
    expect(a.rect).toEqual({ x: 0, y: 0, width: 40, height: 10 });
    expect(b.rect).toEqual({ x: 44, y: 0, width: 40, height: 10 });
  });

  it("caps nested flex container width by maxWidth", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const outer = new Node({ layout: { direction: "row" } });
    const inner = new Node({
      layout: { direction: "row", gap: 4, maxWidth: 50 },
    });
    const a = new Node({ layout: { width: 40, height: 10 } });
    const b = new Node({ layout: { width: 40, height: 10 } });
    inner.add(a, b);
    outer.add(inner);
    root.add(outer);

    resolve(root);

    // inner auto-sizes to 84 (40 + 4 + 40), maxWidth caps the container to 50;
    // children keep their sizes and overflow (no auto-shrink)
    expect(inner.rect.width).toBe(50);
    expect(a.rect.width).toBe(40);
    expect(b.rect.width).toBe(40);
  });

  it("honors flex-item margins on the cross axis", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: { direction: "column", width: 200, height: 60, alignItems: "center" },
    });
    const child = new Node({ layout: { width: 80, height: 20, marginLeft: 30 } });
    flex.add(child);
    root.add(flex);

    resolve(root);

    // margin-box = marginLeft 30 + width 80 = 110; centered in 200 → lead 45;
    // border-box x = 45 + marginLeft 30 = 75
    expect(child.rect.x).toBe(75);
  });

  it("pushes flex item to main-end with margin-left: auto", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: { direction: "row", width: 200, height: 50 },
    });
    const child = new Node({
      layout: { width: 40, height: 20, marginLeft: "auto" },
    });
    flex.add(child);
    root.add(flex);

    resolve(root);

    // 200 - 40 = 160 free space on main axis → margin-left absorbs it all
    expect(child.rect.x).toBe(160);
    // sole child ⇒ availableRect spans main content; auto margin only sets rect.x
    expect(child.availableRect).toEqual({ x: 0, y: 0, width: 200, height: 50 });
  });

  it("stretches flex items on the cross axis by default (align-items: stretch)", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: {
        direction: "column",
        width: 200,
        height: 60,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const child = new Node({ layout: { height: 20 } }); // width auto
    flex.add(child);
    root.add(flex);

    resolve(root);

    // cross axis (width) stretches to fill the container content (200 - 10 - 30 = 160)
    expect(child.rect.width).toBe(160);
  });

  it("does not stretch flex item with explicit cross-axis size", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: { direction: "column", width: 200, height: 100 },
    });
    const child = new Node({ layout: { width: 80, height: 30 } });
    flex.add(child);
    root.add(flex);

    resolve(root);

    // align-items: stretch is default, but explicit width=80 overrides it
    expect(child.rect.width).toBe(80);
    // sole in-flow child ⇒ availableRect spans both content axes (200×100)
    expect(child.availableRect).toEqual({ x: 0, y: 0, width: 200, height: 100 });
  });

  it("collapses to zero when flex container has no children", () => {
    const root = new Node({ layout: { width: 320, height: 240, alignItems: "start" } });
    const flex = new Node({
      layout: {
        direction: "column",
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    root.add(flex);

    resolve(root);

    // empty content collapses to zero; box = padding only (padL+padR × padT+padB = 40 × 60)
    expect(flex.rect).toEqual({ x: 0, y: 0, width: 40, height: 60 });
  });

  it("absolute flex item (inset:0) fills the container on both axes", () => {
    const root = new Node({ layout: { width: 200, height: 100 } });
    const flex = new Node({
      layout: {
        direction: "column",
        width: 200,
        height: 100,
        paddingLeft: 10,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 40,
      },
    });
    const abs = new Node({ layout: { inset: 0 } });
    const sibling = new Node({ layout: { width: 50, height: 20 } });
    flex.add(abs, sibling);
    root.add(flex);

    resolve(root);

    // inset:0 fills the rect (200 × 100); padding affects in-flow content only
    expect(abs.rect).toEqual({ x: 0, y: 0, width: 200, height: 100 });
  });

  it("absolute flex item does not consume main-axis space", () => {
    const root = new Node({ layout: { width: 100, height: 100 } });
    const flex = new Node({
      layout: { direction: "column", width: 100, height: 100 },
    });
    const abs = new Node({ layout: { inset: 0, height: 50 } });
    const a = new Node({ layout: { width: 10, height: 10 } });
    const b = new Node({ layout: { width: 10, height: 10 } });
    flex.add(abs, a, b);
    root.add(flex);

    resolve(root);

    expect(a.rect.y).toBe(0);
    expect(b.rect.y).toBe(10);
  });

  it("absolute flex item is placed by its edges, ignoring justify/align", () => {
    const root = new Node({ layout: { width: 200, height: 200 } });
    const flex = new Node({
      layout: {
        direction: "column",
        width: 200,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
      },
    });
    const abs = new Node({ layout: { top: 5, right: 5, width: 40, height: 40 } });
    flex.add(abs);
    root.add(flex);

    resolve(root);

    expect(abs.rect).toEqual({ x: 155, y: 5, width: 40, height: 40 });
  });

  it("absolute background fills while in-flow sibling centers", () => {
    const root = new Node({ layout: { width: 128, height: 32 } });
    const frame = new Node({
      layout: { inset: 0, direction: "column", justifyContent: "center", alignItems: "center" },
    });
    const bg = new Node({ layout: { inset: 0 } });
    const label = new Node({ layout: { width: 60, height: 12 } });
    frame.add(bg, label);
    root.add(frame);

    resolve(root);

    expect(bg.rect).toEqual({ x: 0, y: 0, width: 128, height: 32 });
    expect(label.rect).toEqual({ x: 34, y: 10, width: 60, height: 12 });
  });

  it("middle in-flow child with auto margins moves within its auto-margin space", () => {
    const root = new Node({ layout: { width: 320, height: 240 } });
    const flex = new Node({
      layout: {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        direction: "column",
        justifyContent: "center",
        paddingTop: 10,
        paddingBottom: 30,
      },
    });
    const e1 = new Node({ layout: { width: 40, height: 10 } });
    const e2 = new Node({ layout: { width: 40, height: 10, marginY: "auto" } });
    const e3 = new Node({ layout: { width: 40, height: 10 } });
    flex.add(e1, e2, e3);
    root.add(flex);

    resolve(root);

    // main content Y = [10, 70]; packed 30, free 30 → e2's two auto margins absorb it (15/15)
    expect(e1.rect).toEqual({ x: 0, y: 10, width: 40, height: 10 });
    expect(e2.rect).toEqual({ x: 0, y: 35, width: 40, height: 10 });
    expect(e3.rect).toEqual({ x: 0, y: 60, width: 40, height: 10 });
    // e1/e3 pinned at the content edges; e2 slides within its auto-margin space [20, 60]
    expect(e1.availableRect).toEqual({ x: 0, y: 10, width: 200, height: 10 });
    expect(e2.availableRect).toEqual({ x: 0, y: 20, width: 200, height: 40 });
    expect(e3.availableRect).toEqual({ x: 0, y: 60, width: 200, height: 10 });
  });
});

describe("grow", () => {
  it("a single grow:1 child fills the free main-axis space", () => {
    const root = new Node({ layout: { width: 100, height: 100, alignItems: "start" } });
    const a = new Node({ layout: { width: 30, height: 20, grow: 1 } });
    root.add(a);
    resolve(root);
    // free = 100 - 20 = 80; grow absorbs all of it → 100
    expect(a.rect).toEqual({ x: 0, y: 0, width: 30, height: 100 });
  });

  it("distributes free space proportionally to grow weights, leaving non-grow items at base size", () => {
    const root = new Node({ layout: { width: 100, height: 80, alignItems: "start" } });
    const a = new Node({ layout: { width: 30, height: 10 } }); // no grow
    const b = new Node({ layout: { width: 30, height: 10, grow: 1 } });
    const c = new Node({ layout: { width: 30, height: 10, grow: 2 } });
    root.add(a, b, c);
    resolve(root);
    // used = 30, free = 50, totalGrow = 3 → floors 16 + 33 = 49, one leftover pixel;
    // fracs 50%3=2 (b) > 100%3=1 (c) → largest remainder goes to b → b 27 / c 43; a stays 10
    expect(a.rect).toEqual({ x: 0, y: 0, width: 30, height: 10 });
    expect(b.rect).toEqual({ x: 0, y: 10, width: 30, height: 27 });
    expect(c.rect).toEqual({ x: 0, y: 37, width: 30, height: 43 });
  });

  it("does nothing when the container has no free main-axis space (auto-sized)", () => {
    const root = new Node({ layout: { width: 100, alignItems: "start" } }); // height auto
    const a = new Node({ layout: { width: 30, height: 40, grow: 1 } });
    root.add(a);
    resolve(root);
    // auto height wraps the child → no free space → grow no-op
    expect(a.rect).toEqual({ x: 0, y: 0, width: 30, height: 40 });
    expect(root.rect.height).toBe(40);
  });
});
