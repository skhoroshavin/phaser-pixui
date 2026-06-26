import { describe, expect, it } from "vitest";
import { createNode, resolve } from "./";

describe("flex", () => {
  it("stacks children vertically in a column", () => {
    const root = createNode({ layout: { width: 320, height: 240 } });
    const flex = createNode({
      layout: { left: 0, top: 0, width: 200, height: 200, direction: "column" },
    });
    const child1 = createNode({ layout: { width: 100, height: 30 } });
    const child2 = createNode({ layout: { width: 80, height: 20 } });
    flex.children = [child1, child2];
    root.children = [flex];

    resolve(root);

    expect(flex.rect).toEqual({ x: 0, y: 0, w: 200, h: 200 });
    expect(child1.rect).toEqual({ x: 0, y: 0, w: 100, h: 30 });
    expect(child2.rect).toEqual({ x: 0, y: 30, w: 80, h: 20 });
  });
});
