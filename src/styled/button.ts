import { type ThemeContext } from "../theme";
import { Clickable } from "../core/clickable";
import {
  ControlFrame,
  type ControlFrameStyle,
  type ResolvedControlFrameStyle,
} from "./control-frame";
import { Component, type ComponentConfig } from "../core/component";
import type { HitShape } from "../core/interactive";

export type ButtonConfig = ComponentConfig & {
  style?: string;
  text?: string;
  enabled?: boolean;
  onClick?: () => void;
};

export type ButtonStyle = ControlFrameStyle & {
  shape?: HitShape;
};

export type ResolvedButtonStyle = ResolvedControlFrameStyle & {
  shape: HitShape;
};

export class Button extends Clickable {
  static readonly styleKey = "button" as const;

  static resolveStyle(
    ctx: ThemeContext,
    raw: Partial<ButtonStyle>,
    def: ButtonStyle,
  ): ResolvedButtonStyle {
    return {
      ...ControlFrame.resolveStyle(ctx, raw, def),
      shape: raw.shape ?? def.shape ?? "rect",
    };
  }

  constructor(parent: Component, cfg: ButtonConfig) {
    const theme = parent.mount.theme;
    const s = theme.resolve(Button, cfg.style);

    super(parent, {
      ...cfg,
      shape: s.shape,
      enabled: cfg.enabled,
      onClick: cfg.onClick,
      onUpdate: (state) => {
        this._frame.state = state;
      },
    });

    this._frame = new ControlFrame(this, { style: s, inset: 0, text: cfg.text });
    this._frame.state = this.state;
  }

  private _frame: ControlFrame;
}
