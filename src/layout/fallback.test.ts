import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

describe("positionTryFallbacks", () => {
  function viewport(width: number, height: number): Node {
    return new Node({ layout: { width, height } });
  }

  // ── backward compatibility ──

  it("does not flip without bounds, even when positionTryFallbacks is set", () => {
    const root = viewport(100, 100);
    const node = new Node({
      layout: { bottom: 10, left: 40, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    root.add(node);

    resolve(root); // no bounds → no overflow check → base placement

    expect(node.rect).toEqual({ x: 40, y: 70, width: 20, height: 20 });
  });

  it("does not consult bounds for a node without positionTryFallbacks", () => {
    const root = viewport(100, 100);
    // base placement overflows the bounds (y 70..90 vs height 60), but the node
    // hasn't opted in → it is placed normally and allowed to clip
    const node = new Node({ layout: { bottom: 10, left: 40, width: 20, height: 20 } });
    root.add(node);

    resolve(root, { x: 0, y: 0, width: 100, height: 60 });

    expect(node.rect).toEqual({ x: 40, y: 70, width: 20, height: 20 });
  });

  // ── base kept when it fits ──

  it("keeps the base placement when it fits the bounds", () => {
    const root = viewport(100, 100);
    const node = new Node({
      layout: { bottom: 10, left: 40, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    root.add(node);

    resolve(root, { x: 0, y: 0, width: 100, height: 100 });

    // base y 70..90 is within bounds → no flip
    expect(node.rect).toEqual({ x: 40, y: 70, width: 20, height: 20 });
  });

  // ── flip-block (top ↔ bottom) ──

  it("flips the block axis (bottom→top) when the base overflows the bounds", () => {
    const root = viewport(100, 100);
    const node = new Node({
      layout: { bottom: 10, left: 40, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    root.add(node);

    resolve(root, { x: 0, y: 0, width: 100, height: 60 });

    // base y 70..90 overflows height 60; bottom:10 mirrors to top:10 → y 10..30, fits
    expect(node.rect).toEqual({ x: 40, y: 10, width: 20, height: 20 });
  });

  it("flips the block axis (top→bottom) against a bounds with a y offset", () => {
    const root = viewport(100, 100);
    const node = new Node({
      layout: { top: 10, left: 40, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    root.add(node);

    resolve(root, { x: 0, y: 40, width: 100, height: 60 });

    // base y 10..30 is above the visible region (y 40..100); top:10 mirrors to
    // bottom:10 → y 70..90, fits
    expect(node.rect).toEqual({ x: 40, y: 70, width: 20, height: 20 });
  });

  // ── flip-inline (left ↔ right) ──

  it("flips the inline axis (right→left) when the base overflows the bounds", () => {
    const root = viewport(100, 100);
    const node = new Node({
      layout: { right: 10, top: 40, width: 20, height: 20, positionTryFallbacks: ["flip-inline"] },
    });
    root.add(node);

    resolve(root, { x: 0, y: 0, width: 60, height: 100 });

    // base x 70..90 overflows width 60; right:10 mirrors to left:10 → x 10..30, fits
    expect(node.rect).toEqual({ x: 10, y: 40, width: 20, height: 20 });
  });

  // ── flip-mode ordering ──

  it("skips a flip mode that does not fit and uses a later one that does", () => {
    const root = viewport(100, 100);
    // overflow is on the block axis (y); flip-inline cannot address it
    const node = new Node({
      layout: {
        bottom: 10,
        left: 30,
        width: 20,
        height: 20,
        positionTryFallbacks: ["flip-inline", "flip-block"],
      },
    });
    root.add(node);

    resolve(root, { x: 0, y: 0, width: 100, height: 60 });

    // flip-inline: left:30→right:30 → x 50, y stays 70 → still overflows → skip
    // flip-block: bottom:10→top:10 → y 10 → fits → use it
    expect(node.rect).toEqual({ x: 30, y: 10, width: 20, height: 20 });
  });

  // ── corner: nothing fits ──

  it("keeps the base placement when no flip mode fits", () => {
    const root = viewport(100, 100);
    // node 60×60 is larger than the bounds 50×50 → can never fit in any variant
    const node = new Node({
      layout: {
        bottom: 10,
        left: 40,
        width: 60,
        height: 60,
        positionTryFallbacks: ["flip-block", "flip-inline"],
      },
    });
    root.add(node);

    resolve(root, { x: 0, y: 0, width: 50, height: 50 });

    // base is x 40, y 30; nothing fits → base is kept (clips)
    expect(node.rect).toEqual({ x: 40, y: 30, width: 60, height: 60 });
  });

  // ── independence ──

  it("evaluates sibling flippable nodes independently", () => {
    const root = viewport(100, 100);
    const a = new Node({
      layout: { bottom: 10, left: 10, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    const b = new Node({
      layout: { top: 10, left: 50, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    root.add(a, b);

    resolve(root, { x: 0, y: 0, width: 100, height: 60 });

    // a base y 70 overflows → flips to y 10; b base y 10 fits → stays
    expect(a.rect).toEqual({ x: 10, y: 10, width: 20, height: 20 });
    expect(b.rect).toEqual({ x: 50, y: 10, width: 20, height: 20 });
  });

  it("threads bounds to a flippable node nested under a non-flippable container", () => {
    const root = viewport(100, 100);
    const container = new Node({ layout: { left: 10, top: 10, width: 80, height: 80 } });
    const bubble = new Node({
      layout: { bottom: 5, left: 20, width: 20, height: 20, positionTryFallbacks: ["flip-block"] },
    });
    container.add(bubble);
    root.add(container);

    resolve(root, { x: 0, y: 0, width: 100, height: 60 });

    // bubble base: x 10+20=30, y 10+(80-5-20)=65 → overflows height 60
    // flip-block: bottom:5→top:5 → y 10+5=15, fits
    expect(bubble.rect).toEqual({ x: 30, y: 15, width: 20, height: 20 });
  });

  // ── subtree follows the flip ──

  it("re-places a flipped node's subtree relative to its new position", () => {
    const root = viewport(100, 100);
    const parent = new Node({
      layout: { bottom: 10, left: 40, width: 40, height: 40, positionTryFallbacks: ["flip-block"] },
    });
    const child = new Node({ layout: { left: 5, top: 5, width: 10, height: 10 } });
    parent.add(child);
    root.add(parent);

    resolve(root, { x: 0, y: 0, width: 100, height: 60 });

    // parent base y 50..90 overflows; flip-block → y 10..50
    expect(parent.rect).toEqual({ x: 40, y: 10, width: 40, height: 40 });
    // child follows: x 40+5=45, y 10+5=15
    expect(child.rect).toEqual({ x: 45, y: 15, width: 10, height: 10 });
  });
});
