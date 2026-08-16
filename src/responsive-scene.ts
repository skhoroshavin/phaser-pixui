import type { Types } from "phaser";
import { Scene } from "phaser";
import { Size } from "./shared/size.ts";

/** {@link ResponsiveScene} configuration. */
export type ResponsiveSceneConfig = Types.Scenes.SettingsConfig & {
  /** Constraints on effective viewport size. Default is minimum 320x240. */
  viewportConstraints?: ViewportConstraints;
  /**
   * Returns the world size, which is later used to set camera boundaries.
   * If undefined, the world is assumed to have the size of the viewport.
   */
  getWorldSize?: () => Size | undefined;
};

/** Constraints on effective viewport size. */
export type ViewportConstraints = {
  /** Constrained viewport width. */
  width?: number;
  /** Constrained viewport height. */
  height?: number;
  /** {@link ConstraintMode}, defaults to `"minimum"`. */
  mode?: ConstraintMode;
};

/**
 * How to interpret viewport constraints.
 *
 * - `"minimum"` - picks the zoom at which the whole constrained area fits
 *   on screen, viewport may be larger. Useful for UI.
 * - `"maximum"` - picks the zoom at which the screen fits inside the
 *   constrained area, viewport may be smaller. Useful for a game world.
 */
export type ConstraintMode = "minimum" | "maximum";

/**
 * A Phaser scene that maintains an integer zoom level based on viewport
 * constraints, adjusting the effective viewport size to match.
 */
export class ResponsiveScene extends Scene {
  constructor(cfg: ResponsiveSceneConfig) {
    super(cfg);

    this.viewportConstraints = cfg.viewportConstraints || {
      width: 320,
      height: 240,
    };
    this._worldSize = cfg.getWorldSize;
    this._updateViewport();
  }

  /** Constraints applied to the effective viewport size. */
  readonly viewportConstraints: ViewportConstraints;

  /** Zoom adjustment added to the calculated zoom. Useful for implementing zoom-in/out. */
  get zoomAdjustment() {
    return this._zoomAdjustment;
  }
  set zoomAdjustment(value: number) {
    this._zoomAdjustment = value;
    this._updateViewport();
    this._updateCamera();
  }
  private _zoomAdjustment = 0;

  /** Current integer zoom level. */
  get zoom() {
    return this._zoom;
  }
  /** Effective viewport size, in pixels. */
  get viewport() {
    return this._viewport;
  }

  create() {
    this._updateCamera();
    this.scale.on("resize", () => {
      this._updateViewport();
      this._updateCamera();
    });
  }

  private _updateViewport() {
    const constraints = this.viewportConstraints;
    if (constraints.width !== undefined || constraints.height !== undefined) {
      const zw = constraints.width ? this._getCanvasWidth() / constraints.width : undefined;
      const zh = constraints.height ? this._getCanvasHeight() / constraints.height : undefined;
      const zmin = zw === undefined ? zh! : zh === undefined ? zw : Math.min(zw, zh);
      const zmax = zw === undefined ? zh! : zh === undefined ? zw : Math.max(zw, zh);
      const z = constraints.mode === "maximum" ? Math.ceil(zmax) : Math.floor(zmin);
      this._zoom = Math.max(1, z + this._zoomAdjustment);
    } else {
      this._zoom = 1;
    }

    this._viewport = {
      width: Math.ceil(this._getCanvasWidth() / this._zoom),
      height: Math.ceil(this._getCanvasHeight() / this._zoom),
    };
  }

  private _updateCamera() {
    this.cameras.main.setZoom(this._zoom);

    const worldSize = this._worldSize?.call(this);
    if (worldSize) {
      const minX = Math.min(0, Math.floor(0.5 * (worldSize.width - this._viewport.width)));
      const minY = Math.min(0, Math.floor(0.5 * (worldSize.height - this._viewport.height)));
      this.cameras.main.setBounds(minX, minY, worldSize.width, worldSize.height);
    } else {
      this.cameras.main.setBounds(0, 0, this._viewport.width, this._viewport.height);
    }
  }

  private _getCanvasWidth(): number {
    return (typeof window !== "undefined" ? window.innerWidth : 800) * this._getDevicePixelRatio();
  }

  private _getCanvasHeight(): number {
    return (typeof window !== "undefined" ? window.innerHeight : 600) * this._getDevicePixelRatio();
  }

  private _getDevicePixelRatio(): number {
    return typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  }

  private _zoom = 1;
  private _viewport!: Size;
  private _worldSize?: () => Size | undefined;
}
