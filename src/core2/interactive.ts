import { type BoxConfig } from "../layout";
import { Component } from "./component";

export type InteractiveConfig = BoxConfig & {
  shape?: HitShape;
  enabled?: boolean;
};

export type HitShape = "rect" | "diamond" | "ellipse";

export class Interactive extends Component {
  constructor(parent: Component, cfg: InteractiveConfig = {}) {
    super(parent, cfg);

    const scene = parent.mount.scene;
    this._shape = cfg.shape ?? "rect";
    this._enabled = cfg.enabled ?? true;

    this._zone = scene.add.zone(0, 0, 0, 0);
    this._updateHitArea(0, 0);

    this.node.onLayout = (rect) => {
      this._zone.setPosition(rect.x, rect.y);
      this._updateHitArea(rect.w, rect.h);
    };
  }

  get visible(): boolean {
    return this._zone.visible;
  }
  set visible(v: boolean) {
    this._zone.setVisible(v);
  }

  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(v: boolean) {
    this._enabled = v;
  }

  private _updateHitArea(w: number, h: number): void {
    let hitArea: Phaser.Geom.Rectangle | Phaser.Geom.Polygon | Phaser.Geom.Ellipse;
    let callback: Phaser.Types.Input.HitAreaCallback;

    switch (this._shape) {
      case "diamond": {
        const hw = w / 2;
        const hh = h / 2;
        hitArea = new Phaser.Geom.Polygon([hw, 0, w, hh, hw, h, 0, hh]);
        callback = Phaser.Geom.Polygon.Contains;
        break;
      }
      case "ellipse": {
        hitArea = new Phaser.Geom.Ellipse(w / 2, h / 2, w, h);
        callback = Phaser.Geom.Ellipse.Contains;
        break;
      }
      default: {
        hitArea = new Phaser.Geom.Rectangle(0, 0, w, h);
        callback = Phaser.Geom.Rectangle.Contains;
        break;
      }
    }

    this._zone.setInteractive(hitArea, callback);
  }

  private _zone: Phaser.GameObjects.Zone;
  private _shape: HitShape;
  private _enabled: boolean;
}
