/**
 * Size in pixels.
 */
export type Size = {
  width: number;
  height: number;
};

/**
 * {@link Size} that can be relative to a parent.
 *
 * - **Positive values** (e.g. 100): Actual size in pixels.
 * - **Zero or negative values** (e.g. -20): Size relative to the parent.
 *   For example, `-20` means 20 px narrower than the parent, and `0` means
 *   the same size as the parent.
 * - **Undefined**: Treated as zero, which means the same size as the parent.
 */
export type RelativeSize = {
  width?: number;
  height?: number;
};
