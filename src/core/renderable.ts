import type { GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;
type Visible = GameObjects.Components.Visible;
type Depth = GameObjects.Components.Depth;

type RenderableConfig<T> = ComponentConfig & {
  onResize?: (internal: T, width: number, height: number) => void;
};

export class Renderable<
  T extends GameObject & Transform & Origin & Visible & Depth,
> extends Component {
  constructor(parent: Component, create: (scene: Phaser.Scene) => T, cfg?: RenderableConfig<T>) {
    super(parent, cfg);
    this.internal = create(this.mount.displayHost.scene!);
    this.internal.setOrigin(0, 0);
    this.mount.displayHost.add(this.internal);
    this.node.onLayout = (rect, depth) => {
      this.internal.setPosition(rect.x, rect.y);
      this.internal.setDepth(depth);
      cfg?.onResize?.(this.internal, rect.width, rect.height);
    };
    this.internal.setVisible(this.visible);
  }

  readonly internal: T;

  protected onVisibilityChange(v: boolean): void {
    this.internal.setVisible(v);
  }
}
