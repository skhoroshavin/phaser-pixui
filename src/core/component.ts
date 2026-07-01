import { Scene } from "phaser";
import { Origin, OriginConfig, OriginX, OriginY } from "../util/origin.ts";
import { Position, RelativePosition } from "../util/position.ts";
import { RelativeSize, Size } from "../util/size.ts";

/**
 * Configuration for creating a {@link Component}.
 *
 * Position (`x`, `y`) is relative to the parent anchor.
 * Size (`width`, `height`) follows {@link RelativeSize} semantics:
 * positive values are absolute pixel width/height, zero or negative values are
 * relative to the parent.
 * Origin determines the alignment point of the component used for positioning.
 */
export type ComponentConfig = RelativePosition &
  RelativeSize &
  OriginConfig & {
    visible?: boolean;
    enabled?: boolean;
  };

/** Absolute position, size, and reference point to be used as an origin. */
export type Anchor = Position & Size & Origin;

/**
 * Base class for all UI components in the PixUI library.
 *
 * A Component occupies a rectangular region defined by position, size, and
 * origin relative to an {@link Anchor} defined by parent. Components form
 * a shadow hierarchy that manages positioning and visibility propagation,
 * but the underlying Phaser game objects remain in a flat display list. This is
 * by design: UI elements are typically positioned only during scene creation rather
 * than every frame, so pre-calculating absolute positions once and rendering a flat
 * list is noticeably more efficient than a hierarchy of `GameObject.Container`.
 *
 * Each component receives its parent's anchor via {@link reposition} and
 * computes its own position and bounds from the combination of local offsets
 * and the parent's anchor.
 *
 * ### Coordinate Model
 * - **Position** (`x`, `y`): Absolute coordinates computed as the parent anchor
 *   position plus `localX`/`localY` offset. The offset direction flips when
 *   the origin is `Right` or `Bottom`, so positive offset values always move
 *   inward from the parent edge.
 * - **Size** (`width`, `height`): Size of the component in pixels. Own size
 *   is initially defined by {@link ComponentConfig} passed to constructor, but can
 *   be updated using `setWidth`/`setHeight` methods. Positive values are absolute
 *   pixel dimensions, while zero or negative values are relative to the parent
 *   (e.g., `-20` means 20 px narrower than the parent).
 * - **Origin** (`originX`, `originY`): Determines which point of the component is
 *   positioned at the (`x`, `y`) coordinate. Values range from 0 (Left/Top)
 *   to 1 (Right/Bottom), with 0.5 for Center. Normally inherited from the parent
 *   anchor, but can be overridden via {@link ComponentConfig} passed to the
 *   constructor.
 *
 * ### Visibility
 * Effective visibility is `parentVisible AND localVisible`. Changes propagate
 * through {@link setParentVisible} (called by containers) and the
 * {@link visible} setter (called by user code). Subclasses override
 * {@link updateVisible} to show/hide their Phaser game objects.
 *
 * ### Subclassing
 * Override {@link updatePosition} to synchronize Phaser game objects with
 * the computed bounds. Override {@link updateVisible} to react to visibility
 * changes. Override {@link setMask} and {@link bringToTop} for masking and
 * order support.
 */
export class Component {
  /**
   * @param scene - The Phaser scene this component belongs to.
   * @param cfg   - Optional layout configuration (position, size, origin, visibility).
   */
  constructor(scene: Scene, cfg?: ComponentConfig) {
    this.scene = scene;
    this._local = {
      x: cfg?.x ?? 0,
      y: cfg?.y ?? 0,
      width: cfg?.width ?? 0,
      height: cfg?.height ?? 0,
      originX: cfg?.originX,
      originY: cfg?.originY,
    };
    this._localVisible = cfg?.visible ?? true;
    this._localEnabled = cfg?.enabled ?? true;
  }
  /** The Phaser scene this component lives in. */
  readonly scene: Scene;

  /** Whether {@link initialize} has been called. */
  get initialized() {
    return this._initialized;
  }
  /**
   * Commits the initial layout. After this call, property mutations
   * automatically trigger {@link updatePosition}. Calling more than
   * once is a no-op.
   */
  initialize() {
    if (this._initialized) return;
    this._initialized = true;
    this.updatePosition();
    this.updateVisible(this.visible);
    this.updateEnabled(this.enabled);
  }
  private _initialized = false;

  /**
   * Effective visibility: `true` only when both local and parent visibility is `true`.
   */
  get visible() {
    return this._parentVisible && this._localVisible;
  }
  /** Sets local visibility. Triggers {@link updateVisible} if effective visibility changes. */
  set visible(value: boolean) {
    const was = this._parentVisible && this._localVisible;
    this._localVisible = value;
    const now = this._parentVisible && this._localVisible;
    if (now !== was) this.updateVisible(now);
  }
  /**
   * Called by parent containers to propagate their visibility state.
   * Triggers {@link updateVisible} if effective visibility changes.
   */
  setParentVisible(value: boolean) {
    const was = this._parentVisible && this._localVisible;
    this._parentVisible = value;
    const now = this._parentVisible && this._localVisible;
    if (now !== was) this.updateVisible(now);
  }
  /** Override in subclasses to show/hide Phaser game objects. */
  protected updateVisible(_visible: boolean) {}
  private _parentVisible = true;
  private _localVisible: boolean;

  /**
   * Effective enabled state: `true` only when both local and parent enabled state is `true`.
   */
  get enabled() {
    return this._parentEnabled && this._localEnabled;
  }
  /** Sets local enabled state. Triggers {@link updateEnabled} if effective state changes. */
  set enabled(value: boolean) {
    const was = this._parentEnabled && this._localEnabled;
    this._localEnabled = value;
    const now = this._parentEnabled && this._localEnabled;
    if (now !== was) this.updateEnabled(now);
  }
  /**
   * Called by parent containers to propagate their enabled state.
   * Triggers {@link updateEnabled} if effective state changes.
   */
  setParentEnabled(value: boolean) {
    const was = this._parentEnabled && this._localEnabled;
    this._parentEnabled = value;
    const now = this._parentEnabled && this._localEnabled;
    if (now !== was) this.updateEnabled(now);
  }
  /** Override in subclasses to react to enabled state changes. */
  protected updateEnabled(_enabled: boolean) {}
  private _parentEnabled = true;
  private _localEnabled: boolean;

  /** Absolute x position (parent x + local offset, flipped when origin is Right). */
  get x() {
    return this._parent.x + (this._local.x ?? 0) * (this.originX === OriginX.Right ? -1 : 1);
  }
  /** Absolute y position (parent y + local offset, flipped when origin is Bottom). */
  get y() {
    return this._parent.y + (this._local.y ?? 0) * (this.originY === OriginY.Bottom ? -1 : 1);
  }
  /** Absolute width. Positive local value = absolute; zero/negative = relative to parent. */
  get width() {
    const w = this._local.width;
    return w > 0 ? w : this._parent.width + w;
  }
  /** Absolute height. Positive local value = absolute; zero/negative = relative to parent. */
  get height() {
    const h = this._local.height;
    return h > 0 ? h : this._parent.height + h;
  }
  /** Horizontal origin (inherited from the parent anchor if not set locally). */
  get originX() {
    return this._local.originX ?? this._parent.originX;
  }
  /** Vertical origin (inherited from the parent anchor if not set locally). */
  get originY() {
    return this._local.originY ?? this._parent.originY;
  }
  /** Left edge in absolute coordinates, derived from x, width, and originX. */
  get left() {
    return this.x - Math.floor(this.originX * this.width);
  }
  /** Right edge in absolute coordinates (`left + width`). */
  get right() {
    return this.left + this.width;
  }
  /** Top edge in absolute coordinates, derived from y, height, and originY. */
  get top() {
    return this.y - Math.floor(this.originY * this.height);
  }
  /** Bottom edge in absolute coordinates (`top + height`). */
  get bottom() {
    return this.top + this.height;
  }
  /** Scene zoom factor, set by the parent via {@link reposition}. */
  get zoom() {
    return this._zoom;
  }

  /** Local x offset relative to the parent anchor. */
  get localX() {
    return this._local.x;
  }
  /** Sets local x offset; triggers {@link updatePosition} if initialized and value differs. */
  set localX(x) {
    this._set("x", x);
  }
  /** Local y offset relative to the parent anchor. */
  get localY() {
    return this._local.y;
  }
  /** Sets local y offset; triggers {@link updatePosition} if initialized and value differs. */
  set localY(y) {
    this._set("y", y);
  }

  /** Sets local width; triggers {@link updatePosition} if initialized and value differs. */
  setWidth(width: number) {
    this._set("width", width);
  }
  /** Sets local height; triggers {@link updatePosition} if initialized and value differs. */
  setHeight(height: number) {
    this._set("height", height);
  }
  /**
   * Called by the parent to supply this component's layout context.
   * Stores the parent anchor and scene zoom, then triggers {@link updatePosition}
   * if the component is already initialized.
   *
   * @param anchor - Parent's absolute position, size, and origin.
   * @param zoom   - Scene zoom factor.
   */
  reposition(anchor: Anchor, zoom: number) {
    this._parent = anchor;
    this._zoom = zoom;
    if (!this._initialized) return;
    this.updatePosition();
  }
  /** Override in subclasses to synchronize Phaser game objects
   * with computed position and size. */
  protected updatePosition() {}
  private readonly _local: Position & Size & OriginConfig;
  private _parent: Anchor = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    originX: OriginX.Left,
    originY: OriginY.Top,
  };
  private _zoom = 1;

  /** Override to bring this component's game objects to the top of the display list. */
  bringToTop() {}

  private _set<K extends "x" | "y" | "width" | "height">(key: K, value: number) {
    const current = this._local[key];
    if (current !== undefined && Math.abs(current - value) < 1) return;
    this._local[key] = value;
    if (!this._initialized) return;
    this.updatePosition();
  }
}
