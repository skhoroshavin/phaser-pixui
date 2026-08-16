/**
 * Layout properties of a component.
 *
 * A practical subset of the CSS box model and flexbox. All values are in pixels.
 */
export type Layout = {
  /** Fixed width, omit for automatic sizing. */
  width?: number;
  /** Fixed height, omit for automatic sizing. */
  height?: number;
  /** Maximum width, caps the final width. */
  maxWidth?: number;

  /**
   * Distance from parent left edge. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  left?: number;
  /**
   * Distance from parent top edge. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  top?: number;
  /**
   * Distance from parent right edge. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  right?: number;
  /**
   * Distance from parent bottom edge. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  bottom?: number;
  /**
   * Distance from parent edges. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  inset?: number;
  /**
   * Distance from parent left and right edges. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  insetX?: number;
  /**
   * Distance from parent top and bottom edges. Setting it anchors the component,
   * taking it out of flow (effectively CSS `position: absolute`).
   */
  insetY?: number;

  /** Flip modes to try when an absolutely positioned component doesn't fit within its viewport. */
  positionTryFallbacks?: FlipMode[];

  /** Padding between the component's left edge and its content. */
  paddingLeft?: number;
  /** Padding between the component's top edge and its content. */
  paddingTop?: number;
  /** Padding between the component's right edge and its content. */
  paddingRight?: number;
  /** Padding between the component's bottom edge and its content. */
  paddingBottom?: number;
  /** Padding between the component's edges and its content. */
  padding?: number;
  /** Padding between the component's left and right edges and its content. */
  paddingX?: number;
  /** Padding between the component's top and bottom edges and its content. */
  paddingY?: number;

  /**
   * Margin between the component's left edge and neighboring components or
   * parent edges. `"auto"` absorbs free space.
   */
  marginLeft?: number | "auto";
  /**
   * Margin between the component's top edge and neighboring components or
   * parent edges. `"auto"` absorbs free space.
   */
  marginTop?: number | "auto";
  /**
   * Margin between the component's right edge and neighboring components or
   * parent edges. `"auto"` absorbs free space.
   */
  marginRight?: number | "auto";
  /**
   * Margin between the component's bottom edge and neighboring components or
   * parent edges. `"auto"` absorbs free space.
   */
  marginBottom?: number | "auto";
  /**
   * Margin between the component's edges and neighboring components or
   * parent edges. `"auto"` absorbs free space.
   */
  margin?: number | "auto";
  /**
   * Margin between the component's left and right edges and neighboring
   * components or parent edges. `"auto"` absorbs free space.
   */
  marginX?: number | "auto";
  /**
   * Margin between the component's top and bottom edges and neighboring
   * components or parent edges. `"auto"` absorbs free space.
   */
  marginY?: number | "auto";

  /** Main axis of flow inside this component. Defaults to `"column"`. */
  direction?: "row" | "column";
  /** Spacing between children along the main axis. */
  gap?: number;
  /** Distribution of children along the main axis. Defaults to `"start"`. */
  justifyContent?: "start" | "center" | "end";
  /** Alignment of children along the cross-axis. Defaults to `"stretch"`. */
  alignItems?: "start" | "center" | "end" | "stretch";
  /**
   * Proportion of parent's free space along the main axis claimed by this
   * component. 0 (default) means no growing.
   */
  grow?: number;

  /** Render order relative to siblings. */
  zIndex?: number;
};

/**
 * How to flip an absolutely positioned component when it overflows the viewport.
 *
 * - `"flip-block"` - flip along the block (vertical) axis: a component
 *   anchored to top/bottom edge moves to the opposite edge.
 * - `"flip-inline"` - flip along the inline (horizontal) axis: a component
 *   anchored to left/right edge moves to the opposite edge.
 * - `"flip-start"` - flip both axes, moving the component diagonally.
 */
export type FlipMode = "flip-block" | "flip-inline" | "flip-start";
