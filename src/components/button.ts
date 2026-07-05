import { Clickable, type ClickableConfig } from "./clickable";
import { Component } from "./component";
import { StateView, type StateVisualConfig } from "./state-view";

export type ButtonConfig = ClickableConfig & {
  texture: string;
  normal: StateVisualConfig;
  hover?: StateVisualConfig;
  pressed?: StateVisualConfig;
  disabled?: StateVisualConfig;
  tileX?: boolean;
  tileY?: boolean;
  text?: string;
  font?: string;
  textTint?: number;
};

export class Button extends Clickable {
  constructor(parent: Component, cfg: ButtonConfig) {
    super(parent, {
      ...cfg,
      onUpdate: (state) => this._view.setState(state),
    });
    this._view = new StateView(this, {
      texture: cfg.texture,
      states: {
        normal: cfg.normal,
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
      fallback: "normal",
      inset: 0,
      tileX: cfg.tileX,
      tileY: cfg.tileY,
      text: cfg.text,
      font: cfg.font,
      textTint: cfg.textTint,
    });
    this._view.setState(this.state);
  }

  private readonly _view: StateView;
}
