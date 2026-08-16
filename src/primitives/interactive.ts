import { GameObjects, Geom, type Types } from "phaser";
import { type Behaviour } from "../behaviours/behaviour";
import { Component, type ComponentConfig } from "./component";
import { PhaserObject } from "./phaser-object";

/** {@link Interactive} configuration. */
export type InteractiveConfig = ComponentConfig & {
  /** Shape of the input hit area. Defaults to `"rect"`. */
  shape?: HitShape;
  /** Initial enabled state. Defaults to `true`. */
  enabled?: boolean;
};

/** Shape of an input hit area. */
export type HitShape = "rect" | "diamond" | "ellipse";

/**
 * A transparent input zone with a configurable hit area shape. Serves as a
 * base class for interactive components, hosting input {@link Behaviour}s.
 */
export class Interactive extends PhaserObject<GameObjects.Zone> {
  constructor(parent: Component, cfg: InteractiveConfig = {}) {
    super(parent, (scene) => new GameObjects.Zone(scene, 0, 0, 0, 0), cfg);

    this._shape = cfg.shape ?? "rect";
    this._enabled = cfg.enabled ?? true;

    this._updateHitArea(0, 0);
  }

  /**
   * Enabled state of this component. Disabled component ignores input,
   * while keeping its visibility unchanged.
   */
  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(v: boolean) {
    if (this._enabled === v) return;
    this._enabled = v;
    for (const b of this._behaviours) b.setActive(v);
    this.onEnabledChange(v);
  }

  /** Adds an input behaviour to this component. */
  addBehaviour<T extends Behaviour>(b: T): T {
    b.attach(this.internal);
    b.setActive(this._enabled && this.visible);
    this._behaviours.push(b);
    return b;
  }

  /** Removes a previously added behaviour. */
  removeBehaviour(b: Behaviour): void {
    b.detach();
    this._behaviours = this._behaviours.filter((x) => x !== b);
  }

  protected setSizeX(width: number): void {
    this._updateHitArea(width, this.node.rect.height);
  }

  protected setSizeY(height: number): void {
    this._updateHitArea(this.node.rect.width, height);
  }

  protected onEnabledChange(_v: boolean): void {}

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    for (const b of this._behaviours) b.setActive(v && this._enabled);
  }

  protected onDestroy(): void {
    for (const b of this._behaviours) b.detach();
    super.onDestroy();
  }

  private _updateHitArea(width: number, height: number): void {
    let hitArea: Phaser.Geom.Rectangle | Phaser.Geom.Polygon | Phaser.Geom.Ellipse;
    let callback: Types.Input.HitAreaCallback;

    switch (this._shape) {
      case "diamond": {
        const hw = width / 2;
        const hh = height / 2;
        hitArea = new Geom.Polygon([hw, 0, width, hh, hw, height, 0, hh]);
        callback = Geom.Polygon.Contains;
        break;
      }
      case "ellipse": {
        hitArea = new Geom.Ellipse(width / 2, height / 2, width, height);
        callback = Geom.Ellipse.Contains;
        break;
      }
      default: {
        hitArea = new Geom.Rectangle(0, 0, width, height);
        callback = Geom.Rectangle.Contains;
        break;
      }
    }

    const zone = this.internal;
    if (zone.input) {
      zone.input.hitArea = hitArea;
      zone.input.hitAreaCallback = callback;
    } else {
      zone.setInteractive(hitArea, callback);
    }
  }

  private _shape: HitShape;
  private _enabled: boolean;
  private _behaviours: Behaviour[] = [];
}
