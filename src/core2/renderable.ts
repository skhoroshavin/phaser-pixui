import type { GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;
type Visible = GameObjects.Components.Visible;
type Depth = GameObjects.Components.Depth;

export class Renderable<T extends GameObject & Transform & Origin & Visible & Depth> extends Component {
  constructor(parent: Component, internal: T, cfg?: ComponentConfig) {
    super(parent, cfg);
    this.internal = internal;
    internal.setOrigin(0, 0);
    this.node.onLayout = (rect, depth) => {
      internal.setPosition(rect.x, rect.y);
      internal.setDepth(depth);
    };

    internal.setVisible(this.visible);
  }

  readonly internal: T;

  protected onVisibilityChange(v: boolean): void {
    this.internal.setVisible(v);
  }
}
