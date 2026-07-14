import { type GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;
type Visible = GameObjects.Components.Visible;
type Depth = GameObjects.Components.Depth;

export class PhaserObject<
  T extends GameObject & Transform & Origin & Visible & Depth,
> extends Component {
  constructor(parent: Component, create: (scene: Phaser.Scene) => T, cfg?: ComponentConfig) {
    super(parent, cfg);
    this.internal = create(this.displayHost.scene!);
    this.internal.setOrigin(0, 0);
    this.displayHost.add(this.internal);
    this.node.onLayout = (rect, depth) => {
      this.internal.setPosition(rect.x + this._offsetX, rect.y + this._offsetY);
      this.internal.setDepth(depth);
      this.setSizeX(rect.width);
      this.setSizeY(rect.height);
    };
    this.internal.setVisible(this.visible);
  }

  readonly internal: T;

  protected setOffsetX(x: number): void {
    this.internal.x += x - this._offsetX;
    this._offsetX = x;
  }

  protected setOffsetY(y: number): void {
    this.internal.y += y - this._offsetY;
    this._offsetY = y;
  }

  protected setSizeX(_width: number): void {
    // default: no-op (e.g. sprites keep their intrinsic size)
  }

  protected setSizeY(_height: number): void {
    // default: no-op
  }

  protected onVisibilityChange(v: boolean): void {
    this.internal.setVisible(v);
  }

  protected onDestroy(): void {
    this.internal.destroy();
  }

  private _offsetX = 0;
  private _offsetY = 0;
}
