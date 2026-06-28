import {
  finalizeSize,
  measureBottomUp,
  measureTopDown,
  seedRootRect,
  seedRootWidth,
} from "./measure";
import { type Node } from "./node";
import { place } from "./place";

/** Resolve a layout tree. */
export function resolve(root: Node): void {
  assignDepths(root, { next: 0 });

  seedRootWidth(root);
  measureTopDown(root);
  measureBottomUp(root);

  seedRootRect(root);
  finalizeSize(root);
  place(root);
}

function assignDepths(node: Node, c: { next: number }): void {
  const neg = node.children.filter((ch) => ch.zIndex < 0).sort((a, b) => a.zIndex - b.zIndex);
  const rest = node.children.filter((ch) => ch.zIndex >= 0).sort((a, b) => a.zIndex - b.zIndex);
  neg.forEach((ch) => assignDepths(ch, c));
  node.depth = c.next++;
  rest.forEach((ch) => assignDepths(ch, c));
}
