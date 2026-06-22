import type { GameObjects } from "phaser";
import { Scene } from "phaser";
import { Component, ComponentConfig } from "./component.ts";

type Rectangle = GameObjects.Rectangle;

export class Mask extends Component {
  constructor(scene: Scene, cfg?: ComponentConfig) {
    super(scene, cfg);
    this.internal = scene.add.rectangle();
    this.internal.setFillStyle(0);
    this.internal.setVisible(false);
  }

  protected override updatePosition() {
    this.internal.setOrigin(this.originX, this.originY);
    this.internal.setPosition(this.x, this.y);
    this.internal.setSize(this.width, this.height);
  }

  readonly internal: Rectangle;
}
