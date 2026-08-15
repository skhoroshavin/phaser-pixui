import { finalizeSize, measureBottomUp, measureTopDown, seedRootRect, seedWidths } from "./measure";
import { type Node } from "./node";
import type { Rect } from "../shared/rect";
import { place } from "./place";

/** Resolve a layout tree. */
export function resolve(root: Node, bounds?: Rect): Rect {
  assignDepths(root, { next: 0 });

  seedWidths(root);
  measureBottomUp(root);
  measureTopDown(root);
  measureBottomUp(root);

  seedRootRect(root);
  finalizeSize(root);
  return place(root, bounds);
}

function assignDepths(node: Node, c: { next: number }): void {
  const neg = node.children.filter((ch) => ch.zIndex < 0).sort((a, b) => a.zIndex - b.zIndex);
  const rest = node.children.filter((ch) => ch.zIndex >= 0).sort((a, b) => a.zIndex - b.zIndex);
  neg.forEach((ch) => assignDepths(ch, c));
  node.depth = c.next++;
  rest.forEach((ch) => assignDepths(ch, c));
}
