import { GameObjects } from "phaser";
import { type ComponentConfig } from "./component";
import type { Mount } from "../mounts/mount";
import { PhaserObject } from "./phaser-object";

export type RectangleConfig = ComponentConfig & {
  fillColor?: number;
  fillAlpha?: number;
};

export class Rectangle extends PhaserObject<GameObjects.Rectangle> {
  constructor(parent: Mount, cfg?: RectangleConfig) {
    super(parent, (scene) => new GameObjects.Rectangle(scene, 0, 0, 0, 0), {
      ...cfg,
      onResize: (r, w, h) => r.setSize(w, h),
    });
    if (cfg?.fillColor !== undefined) {
      this.internal.setFillStyle(cfg.fillColor, cfg?.fillAlpha ?? 1);
    }
  }
}
