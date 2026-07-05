import type { GameObjects } from "phaser";
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
    this.internal = create(this.mount.displayHost.scene!);
    this.internal.setOrigin(0, 0);
    this.mount.displayHost.add(this.internal);
    this.node.onLayout = (rect, depth) => {
      this.internal.setPosition(rect.x + this._renderOffsetX, rect.y + this._renderOffsetY);
      this.internal.setDepth(depth);
      cfg?.onResize?.(this.internal, rect.width, rect.height);
    };
    this.internal.setVisible(this.visible);
  }

  readonly internal: T;

  setRenderOffset(dx: number, dy: number): void {
    this.internal.x += dx - this._renderOffsetX;
    this.internal.y += dy - this._renderOffsetY;
    this._renderOffsetX = dx;
    this._renderOffsetY = dy;
  }

  protected onVisibilityChange(v: boolean): void {
    this.internal.setVisible(v);
  }

  private _renderOffsetX = 0;
  private _renderOffsetY = 0;
}
