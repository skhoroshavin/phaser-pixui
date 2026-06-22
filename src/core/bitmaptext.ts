import type { GameObjects } from "phaser";
import { Scene } from "phaser";
import { TextAlign } from "../util/align.ts";
import { Renderable, RenderableConfig } from "./renderable.ts";

export type BitmapTextConfig = {
  font: string;
  size?: number;
  align?: TextAlign;
  text?: string;
} & RenderableConfig;

export class BitmapText extends Renderable<GameObjects.BitmapText> {
  constructor(scene: Scene, cfg: BitmapTextConfig) {
    super(
      scene,
      cfg,
      scene.make.bitmapText({
        font: cfg.font,
        size: cfg.size,
        visible: false,
      }),
    );

    if (cfg.align) this.align = cfg.align;
    if (cfg.text) this.text = cfg.text;
  }

  get text() {
    return this.internal.text;
  }
  set text(value: string) {
    this.internal.text = value;
    this.setWidth(this.internal.width);
    this.setHeight(this.internal.height);
  }

  get align(): TextAlign {
    return this.internal.align;
  }
  set align(value: TextAlign) {
    this.internal.align = value;
  }

  get width() {
    return this.internal.width;
  }
  get height() {
    return this.internal.height;
  }

  protected override updatePosition() {
    this.internal.setOrigin(0, 0);
    this.internal.setPosition(this.left, this.top);
    this.internal.setMaxWidth(super.width);
  }
}
