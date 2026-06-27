import type { GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;

export class Renderable<T extends GameObject & Transform & Origin> extends Component {
  constructor(parent: Component, internal: T, cfg?: ComponentConfig) {
    super(parent, cfg);
    this.internal = internal;
    internal.setOrigin(0, 0);
    this.node.onLayout = (rect) => {
      internal.setPosition(rect.x, rect.y);
    };
  }

  readonly internal: T;
}
