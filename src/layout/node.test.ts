import { describe, expect, it } from "vitest";
import { createNode } from "./";

describe("createNode", () => {
  it("creates node with defaults when called without arguments", () => {
    const node = createNode({});

    expect(node.box.left).toBeUndefined();
    expect(node.box.top).toBeUndefined();
    expect(node.box.right).toBeUndefined();
    expect(node.box.bottom).toBeUndefined();
    expect(node.box.width).toBeUndefined();
    expect(node.box.height).toBeUndefined();
    expect(node.children).toEqual([]);
    expect(node.rect.x).toBeNaN();
    expect(node.rect.y).toBeNaN();
    expect(node.rect.w).toBeNaN();
    expect(node.rect.h).toBeNaN();
    expect(node.intrinsic).toBeUndefined();
    expect(node.onLayout).toBeUndefined();
  });
});
