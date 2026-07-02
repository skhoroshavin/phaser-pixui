import { GameObjects, Geom, type Types } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { Renderable } from "./renderable";

export type InteractiveConfig = ComponentConfig & {
  shape?: HitShape;
  enabled?: boolean;
};

export type HitShape = "rect" | "diamond" | "ellipse";

export class Interactive extends Renderable<GameObjects.Zone> {
  constructor(parent: Component, cfg: InteractiveConfig = {}) {
    super(parent, (scene) => new GameObjects.Zone(scene, 0, 0, 0, 0), {
      ...cfg,
      onResize: (_zone, w, h) => this._updateHitArea(w, h),
    });

    this._shape = cfg.shape ?? "rect";
    this._enabled = cfg.enabled ?? true;

    this._updateHitArea(0, 0);
  }

  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(v: boolean) {
    this._enabled = v;
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
        hitArea = new Geom.Ellipse(width / 2, width / 2, width, height);
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
}
