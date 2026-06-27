import { describe, expect, it } from "vitest";
import { createNode } from "./";

describe("createNode", () => {
  it("creates node with defaults when called without arguments", () => {
    const node = createNode({});

    expect(node.layout.left).toBeUndefined();
    expect(node.layout.top).toBeUndefined();
    expect(node.layout.right).toBeUndefined();
    expect(node.layout.bottom).toBeUndefined();
    expect(node.layout.width).toBeUndefined();
    expect(node.layout.height).toBeUndefined();
    expect(node.children).toEqual([]);
    expect(node.rect.x).toBeNaN();
    expect(node.rect.y).toBeNaN();
    expect(node.rect.w).toBeNaN();
    expect(node.rect.h).toBeNaN();
    expect(node.intrinsic).toBeUndefined();
    expect(node.onLayout).toBeUndefined();
  });
});
