import { GameObjects, Geom, type Types } from "phaser";
import { type Behaviour } from "../behaviours/behaviour";
import { type ComponentConfig } from "./component";
import type { Mount } from "../mounts/mount";
import { PhaserObject } from "./phaser-object";

export type InteractiveConfig = ComponentConfig & {
  shape?: HitShape;
  enabled?: boolean;
};

export type HitShape = "rect" | "diamond" | "ellipse";

export class Interactive extends PhaserObject<GameObjects.Zone> {
  constructor(parent: Mount, cfg: InteractiveConfig = {}) {
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
    if (this._enabled === v) return;
    this._enabled = v;
    for (const b of this._behaviours) b.setActive(v);
    this.onEnabledChange(v);
  }

  protected onEnabledChange(_v: boolean): void {}

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    for (const b of this._behaviours) b.setActive(v && this._enabled);
  }

  addBehaviour<T extends Behaviour>(b: T): T {
    b.attach(this.internal);
    b.setActive(this._enabled && this.visible);
    this._behaviours.push(b);
    return b;
  }

  removeBehaviour(b: Behaviour): void {
    b.detach();
    this._behaviours = this._behaviours.filter((x) => x !== b);
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
  private _behaviours: Behaviour[] = [];
}
