import { themeBinding, type StyleResolver } from "../theme2";
import type { BoxConfig } from "../layout";
import { Clickable } from "../core2/clickable";
import { ControlFrame, ControlFrameStyleResolver, type ControlFrameStyle } from "./control-frame";
import type { Component } from "../core2/component";
import type { HitShape } from "../core2/interactive";

export type ButtonConfig = BoxConfig & {
  style?: string;
  enabled?: boolean;
  onClick?: () => void;
};

export type ButtonStyle = ControlFrameStyle & {
  shape?: HitShape;
};

const ButtonStyleResolver = {
  ...ControlFrameStyleResolver,
  shape: (_ctx, raw) => raw ?? "rect",
} satisfies StyleResolver<ButtonStyle>;

export class Button extends Clickable {
  static readonly binding = themeBinding<ButtonStyle>()("button", ButtonStyleResolver);

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

    this._frame = new ControlFrame(this, { style: s, inset: 0 });
    this._frame.state = this.state;
  }

  private _frame: ControlFrame;
}
