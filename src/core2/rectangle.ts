import { Component, type ComponentConfig } from "./component";
import { Renderable } from "./renderable";

export type RectangleConfig = ComponentConfig & {
  fillColor?: number;
  fillAlpha?: number;
};

export class Rectangle extends Renderable<Phaser.GameObjects.Rectangle> {
  constructor(parent: Component, cfg?: RectangleConfig) {
    const internal = parent.mount.scene.add.rectangle(0, 0, 0, 0);
    super(parent, internal, cfg);

    const origLayout = this.node.onLayout;
    this.node.onLayout = (rect, depth) => {
      origLayout?.(rect, depth);
      internal.setSize(rect.w, rect.h);
    };

    if (cfg?.fillColor !== undefined) {
      internal.setFillStyle(cfg.fillColor, cfg?.fillAlpha ?? 1);
    }
  }
}
