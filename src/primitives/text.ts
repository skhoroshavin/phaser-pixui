import { TintModes, GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { PhaserObject } from "./phaser-object";
import type { Size } from "../shared/size";

export type TextConfig = ComponentConfig & {
  font: string;
  text?: string;
  color?: number;
  align?: TextAlign;
};

export type TextAlign = "left" | "center" | "right";

export class Text extends PhaserObject<GameObjects.BitmapText> {
  constructor(parent: Component, cfg: TextConfig) {
    super(
      parent,
      (scene) => new GameObjects.BitmapText(scene, 0, 0, cfg.font, cfg.text ?? ""),
      cfg,
    );
    this.node.setIntrinsicSize((availableWidth?: number): Size => {
      this.internal.setMaxWidth(availableWidth ?? 0);
      return this.internal.getTextBounds(true).global;
    });
    if (cfg.color !== undefined) this.setColor(cfg.color);
    switch (cfg.align) {
      case "center":
        this.internal.align = 1;
        break;
      case "right":
        this.internal.align = 2;
        break;
    }
  }

  get text(): string {
    return this.internal.text;
  }
  set text(value: string) {
    this.internal.setText(value);
    this.resolveLayout();
  }

  setColor(color: number): void {
    this.internal.setTint(color).setTintMode(TintModes.FILL);
  }
}
