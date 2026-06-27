import { describe, expect, it } from "vitest";
import { createNode, resolve, type Node } from "./";

describe("measure", () => {
  function viewport(w: number, h: number): Node {
    return createNode({ layout: { width: w, height: h } });
  }

  it("uses a closure intrinsic's returned size", () => {
    const root = viewport(200, 200);
    root.children = [createNode({ layout: {}, intrinsic: () => ({ w: 50, h: 30 }) })];
    resolve(root);
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, w: 50, h: 30 });
  });

  it("passes the explicit width to the closure as availableWidth", () => {
    const root = viewport(200, 200);
    root.children = [
      createNode({ layout: { width: 100 }, intrinsic: (aw) => ({ w: 0, h: aw ?? 0 }) }),
    ];
    resolve(root);
    // width axis is explicit (100); the received availableWidth surfaces as height
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, w: 100, h: 100 });
  });

  it("caps the availableWidth by maxWidth", () => {
    const root = viewport(200, 200);
    root.children = [
      createNode({
        layout: { width: 200, maxWidth: 80 },
        intrinsic: (aw) => ({ w: 0, h: aw ?? 0 }),
      }),
    ];
    resolve(root);
    // width is explicit (200); availableWidth is capped to 80, surfacing as height
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, w: 200, h: 80 });
  });

  it("passes the stretch width into a definite parent as availableWidth", () => {
    const root = viewport(200, 200);
    root.children = [
      createNode({ layout: { left: 0, right: 0 }, intrinsic: (aw) => ({ w: 0, h: aw ?? 0 }) }),
    ];
    resolve(root);
    // stretched to the parent's 200 width; availableWidth surfaces as height
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, w: 200, h: 200 });
  });

  it("passes undefined to the closure when nothing limits the width", () => {
    const root = viewport(200, 200);
    root.children = [
      createNode({ layout: {}, intrinsic: (aw) => ({ w: aw === undefined ? 50 : 0, h: 30 }) }),
    ];
    resolve(root);
    // closure saw undefined (no-wrap signal) only if width is 50, not 0
    expect(root.children[0]!.rect).toEqual({ x: 0, y: 0, w: 50, h: 30 });
  });

  it("flows a stretched leaf's wrapped height up to an auto-height parent", () => {
    const root = viewport(200, 200);
    const container = createNode({ layout: { width: 200 } }); // height auto
    container.children = [
      createNode({ layout: { left: 0, right: 0 }, intrinsic: (aw) => ({ w: 0, h: aw === 200 ? 40 : 0 }) }),
    ];
    root.children = [container];
    resolve(root);
    // container auto-heights to 40 only if the leaf closure saw the 200 stretch
    // width during the container's own measurement (aggregation threading)
    expect(container.rect).toEqual({ x: 0, y: 0, w: 200, h: 40 });
  });
});
