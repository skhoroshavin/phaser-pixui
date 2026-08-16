import { TintModes, GameObjects } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { PhaserObject } from "./phaser-object";
import type { Size } from "../shared/size";

/** {@link Text} configuration. */
export type TextConfig = ComponentConfig & {
  /** Bitmap font key. */
  font: string;
  /** Initial text content. Defaults to `""`. */
  text?: string;
  /** Text color. */
  color?: number;
  /** Text alignment. Defaults to `"left"`. */
  align?: TextAlign;
};

/** Horizontal text alignment. */
export type TextAlign = "left" | "center" | "right";

/**
 * Displays bitmap text. Sizes itself to fit the text, wrapping lines when
 * constrained by available width.
 */
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

  /** Current text content. Changing it schedules layout resolution before rendering the frame. */
  get text(): string {
    return this.internal.text;
  }
  set text(value: string) {
    this.internal.setText(value);
    this.resolveLayout();
  }

  /** Sets text color tint. */
  setColor(color: number): void {
    this.internal.setTint(color).setTintMode(TintModes.FILL);
  }
}
