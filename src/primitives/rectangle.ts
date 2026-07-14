import { GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { PhaserObject } from "./phaser-object";

export type RectangleConfig = ComponentConfig & {
  fillColor?: number;
  fillAlpha?: number;
};

export class Rectangle extends PhaserObject<GameObjects.Rectangle> {
  constructor(parent: Component, cfg?: RectangleConfig) {
    super(parent, (scene) => new GameObjects.Rectangle(scene, 0, 0, 0, 0), cfg);
    if (cfg?.fillColor !== undefined) {
      this.internal.setFillStyle(cfg.fillColor, cfg?.fillAlpha ?? 1);
    }
  }

  protected setSizeX(width: number): void {
    this.internal.setSize(width, this.internal.height);
  }

  protected setSizeY(height: number): void {
    this.internal.setSize(this.internal.width, height);
  }
}
