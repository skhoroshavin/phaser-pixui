import type { GameObjects } from "phaser";
import { type BoxConfig } from "../layout/node";
import { Component } from "./component";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;

export class Renderable<T extends GameObject & Transform & Origin> extends Component {
  constructor(parent: Component, inner: T, cfg?: BoxConfig) {
    super(parent, cfg);
    this.inner = inner;
    inner.setOrigin(0, 0);
    this.node.onLayout = (rect) => {
      inner.setPosition(rect.x, rect.y);
    };
  }

  readonly inner: T;
}
