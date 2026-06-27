import { TintModes } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { Renderable } from "./renderable";

export class BitmapText extends Renderable<Phaser.GameObjects.BitmapText> {
  constructor(
    parent: Component,
    cfg: { font: string; text?: string; tint?: number } & ComponentConfig,
  ) {
    const scene = parent.mount.scene;
    const inner = scene.add.bitmapText(0, 0, cfg.font, cfg.text ?? "");
    super(parent, inner, cfg);
    this.node.intrinsic = { w: inner.width, h: inner.height };
    if (cfg.tint !== undefined) inner.setTint(cfg.tint).setTintMode(TintModes.FILL);
  }
}
