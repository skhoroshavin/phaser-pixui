import { TintModes, GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { Renderable } from "./renderable";

export class BitmapText extends Renderable<GameObjects.BitmapText> {
  constructor(
    parent: Component,
    cfg: { font: string; text?: string; tint?: number } & ComponentConfig,
  ) {
    super(
      parent,
      (scene) => new GameObjects.BitmapText(scene, 0, 0, cfg.font, cfg.text ?? ""),
      cfg,
    );
    this.node.intrinsic = { w: this.internal.width, h: this.internal.height };
    if (cfg.tint !== undefined) this.internal.setTint(cfg.tint).setTintMode(TintModes.FILL);
  }
}
