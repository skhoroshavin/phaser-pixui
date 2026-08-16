import { finalizeSize, measureBottomUp, measureTopDown, seedRootRect, seedWidths } from "./measure";
import { type Node } from "./node";
import type { Rect } from "../shared/rect";
import { place } from "./place";

/**
 * Resolves a layout tree: measures all nodes, assigns rects, and places
 * children inside their parents. Returns the bounding rect of the whole tree.
 * `bounds` is the optional viewport rect, used for position try fallbacks.
 *
 * The algorithm is a multi-pass constraint resolution modeled after the CSS
 * Flexbox layout algorithm:
 *  1. bottom-up pass computes intrinsic (max-content-like) sizes of all nodes;
 *  2. top-down pass propagates available widths, so text wraps instead of
 *     overflowing and `grow` distributes free space in rows (cf. flexbox's
 *     "resolve the flexible lengths" step);
 *  3. bottom-up re-measure, since assigned widths invalidate natural sizes;
 *  4. top-down final size resolution against the parent's definitive size
 *     (stretch between edges, cross-axis stretch, `grow` distribution along
 *     the main axis using the largest-remainder method for integer rounding);
 *  5. placement pass positions children (justify-content, align-items,
 *     auto margins) and handles absolute children with try fallbacks.
 */
export function resolve(root: Node, bounds?: Rect): Rect {
  assignDepths(root, { next: 0 });

  // Seed explicit widths, to be anchored to by the following passes
  seedWidths(root);
  // Measure nodes natural sizes, from leaves to root
  measureBottomUp(root);
  // Propagate assigned widths from root to leaves, so that text wraps
  // instead of overflowing, and grow distributes free space in rows
  measureTopDown(root);
  // Re-measure natural sizes, top-down pass may have changed child widths
  // (text wrapping, grow), invalidating the previous bottom-up results
  measureBottomUp(root);

  // Seed the root rect from the measured size
  seedRootRect(root);
  // Derive each child's final size from its parent's final size, top-down
  finalizeSize(root);
  // Place nodes inside their parents
  return place(root, bounds);
}

function assignDepths(node: Node, c: { next: number }): void {
  const neg = node.children.filter((ch) => ch.zIndex < 0).sort((a, b) => a.zIndex - b.zIndex);
  const rest = node.children.filter((ch) => ch.zIndex >= 0).sort((a, b) => a.zIndex - b.zIndex);
  neg.forEach((ch) => assignDepths(ch, c));
  node.depth = c.next++;
  rest.forEach((ch) => assignDepths(ch, c));
}
