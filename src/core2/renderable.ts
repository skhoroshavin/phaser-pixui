import type { GameObjects } from "phaser";
import { type BoxConfig } from "../layout/node";
import { Component } from "./component";
import type { ViewportMount } from "./viewport-mount";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;

export class Renderable<T extends GameObject & Transform & Origin> extends Component {
  constructor(mount: ViewportMount, inner: T, cfg?: BoxConfig) {
    super(mount, cfg);
    this.inner = inner;
    inner.setOrigin(0, 0);
    this.node.onLayout = (rect) => {
      inner.setPosition(rect.x, rect.y);
    };
  }

  readonly inner: T;
}
