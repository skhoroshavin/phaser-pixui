/**
 * Position in pixels.
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * {@link Position} relative to a parent, where undefined values are treated as the same as parent.
 */
export type RelativePosition = {
  x?: number;
  y?: number;
};
