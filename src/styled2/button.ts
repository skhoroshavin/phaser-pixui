import { themeBinding, type StyleResolver } from "../theme2";
import { Clickable } from "../core2/clickable";
import { ControlFrame, ControlFrameStyleResolver, type ControlFrameStyle } from "./control-frame";
import { Component, type ComponentConfig } from "../core2/component";
import type { HitShape } from "../core2/interactive";

export type ButtonConfig = ComponentConfig & {
  style?: string;
  text?: string;
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

    this._frame = new ControlFrame(this, { style: s, inset: 0, text: cfg.text });
    this._frame.state = this.state;
  }

  private _frame: ControlFrame;
}
