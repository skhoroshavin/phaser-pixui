import { TintModes } from "phaser";
import { type BoxConfig } from "../layout/node";
import { Renderable } from "./renderable";
import type { ViewportMount } from "./viewport-mount";

export class BitmapText extends Renderable<Phaser.GameObjects.BitmapText> {
  constructor(
    mount: ViewportMount,
    cfg: { font: string; text?: string; tint?: number } & BoxConfig,
  ) {
    const inner = mount.scene.add.bitmapText(0, 0, cfg.font, cfg.text ?? "");
    super(mount, inner, cfg);
    this.node.intrinsic = { w: inner.width, h: inner.height };
    if (cfg.tint !== undefined) inner.setTint(cfg.tint).setTintMode(TintModes.FILL);
  }
}
