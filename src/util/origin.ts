/**
 * Represents the alignment point used for positioning.
 */
export type Origin = {
  originX: OriginX;
  originY: OriginY;
};

/**
 * {@link Origin} configuration with optional values to enable defaults.
 */
export type OriginConfig = {
  originX?: OriginX;
  originY?: OriginY;
};

/**
 * Horizontal origin that controls positioning along the x-axis.
 */
export enum OriginX {
  /** Position is relative to the left edge */
  Left = 0,
  /** Position is relative to the horizontal center */
  Center = 0.5,
  /** Position is relative to the right edge */
  Right = 1,
}

/**
 * Vertical origin that controls positioning along the y-axis.
 */
export enum OriginY {
  /** Position is relative to the top edge */
  Top = 0,
  /** Position is relative to the vertical center */
  Center = 0.5,
  /** Position is relative to the bottom edge */
  Bottom = 1,
}
