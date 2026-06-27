import { Geom, type Types } from "phaser";
import { Component, type ComponentConfig } from "./component";

export type InteractiveConfig = ComponentConfig & {
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
    this._zone.setOrigin(0, 0);
    this._updateHitArea(0, 0);

    this.node.onLayout = (rect) => {
      this._zone.setPosition(rect.x, rect.y);
      this._updateHitArea(rect.w, rect.h);
    };

    this._zone.setVisible(this.visible);
  }

  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(v: boolean) {
    this._enabled = v;
  }

  private _updateHitArea(w: number, h: number): void {
    let hitArea: Phaser.Geom.Rectangle | Phaser.Geom.Polygon | Phaser.Geom.Ellipse;
    let callback: Types.Input.HitAreaCallback;

    switch (this._shape) {
      case "diamond": {
        const hw = w / 2;
        const hh = h / 2;
        hitArea = new Geom.Polygon([hw, 0, w, hh, hw, h, 0, hh]);
        callback = Geom.Polygon.Contains;
        break;
      }
      case "ellipse": {
        hitArea = new Geom.Ellipse(w / 2, h / 2, w, h);
        callback = Geom.Ellipse.Contains;
        break;
      }
      default: {
        hitArea = new Geom.Rectangle(0, 0, w, h);
        callback = Geom.Rectangle.Contains;
        break;
      }
    }

    if (this._zone.input) {
      this._zone.input.hitArea = hitArea;
      this._zone.input.hitAreaCallback = callback;
    } else {
      this._zone.setInteractive(hitArea, callback);
    }
  }

  protected onVisibilityChange(v: boolean): void {
    this._zone.setVisible(v);
  }

  protected _zone: Phaser.GameObjects.Zone;
  private _shape: HitShape;
  private _enabled: boolean;
}
