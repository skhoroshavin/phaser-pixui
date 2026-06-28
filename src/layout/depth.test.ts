import { describe, expect, it } from "vitest";
import { Node, resolve } from "./";

describe("depth assignment", () => {
  it("assigns ascending depths by array order when zIndex is default", () => {
    const root = new Node({ layout: { width: 100, height: 100 } });
    const a = new Node({});
    const b = new Node({});
    const c = new Node({});
    root.add(a, b, c);

    resolve(root);

    expect(root.depth).toBe(0);
    expect(a.depth).toBe(1);
    expect(b.depth).toBe(2);
    expect(c.depth).toBe(3);
  });

  it("paints negative-z children behind the node, non-negative ahead", () => {
    const root = new Node({ layout: { width: 100, height: 100 } });
    const neg = new Node({ layout: { zIndex: -1 } });
    const zero = new Node({}); // zIndex defaults to 0
    const pos = new Node({ layout: { zIndex: 5 } });
    // Array order deliberately out of z-order — proves the walk sorts, not just iterates.
    root.add(pos, zero, neg);

    resolve(root);

    expect(neg.depth).toBe(0);
    expect(root.depth).toBe(1);
    expect(zero.depth).toBe(2);
    expect(pos.depth).toBe(3);
  });
});
