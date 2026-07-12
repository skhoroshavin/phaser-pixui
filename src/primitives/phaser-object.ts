import { type GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;
type Visible = GameObjects.Components.Visible;
type Depth = GameObjects.Components.Depth;

type PhaserObjectConfig<T> = ComponentConfig & {
  onResize?: (internal: T, width: number, height: number) => void;
};

export class PhaserObject<
  T extends GameObject & Transform & Origin & Visible & Depth,
> extends Component {
  constructor(parent: Component, create: (scene: Phaser.Scene) => T, cfg?: PhaserObjectConfig<T>) {
    super(parent, cfg);
    this._onResize = cfg?.onResize;
    this.internal = create(this.displayHost.scene!);
    this.internal.setOrigin(0, 0);
    this.displayHost.add(this.internal);
    this.node.onLayout = (rect, depth) => {
      this.internal.setPosition(rect.x + this._offsetX, rect.y + this._offsetY);
      this.internal.setDepth(depth);
      this._resize(rect.width, rect.height);
    };
    this.internal.setVisible(this.visible);
  }

  readonly internal: T;

  setOffsetX(dx: number): void {
    this.internal.x += dx - this._offsetX;
    this._offsetX = dx;
  }

  setOffsetY(dy: number): void {
    this.internal.y += dy - this._offsetY;
    this._offsetY = dy;
  }

  setScaleX(x: number): void {
    this._scaleX = x;
    this._resize(this.node.rect.width, this.node.rect.height);
  }

  setScaleY(y: number): void {
    this._scaleY = y;
    this._resize(this.node.rect.width, this.node.rect.height);
  }

  private _resize(width: number, height: number): void {
    this._onResize?.(
      this.internal,
      Math.floor(width * this._scaleX),
      Math.floor(height * this._scaleY),
    );
  }

  protected onVisibilityChange(v: boolean): void {
    this.internal.setVisible(v);
  }

  protected onDestroy(): void {
    this.internal.destroy();
  }

  private readonly _onResize?: (internal: T, width: number, height: number) => void;
  private _offsetX = 0;
  private _offsetY = 0;
  private _scaleX = 1;
  private _scaleY = 1;
}
