import { Clickable, type ClickableConfig } from "./clickable";
import type { Component } from "./component";
import { StateView, type StateVisualConfig } from "./state-view";

export type ButtonConfig = Omit<ClickableConfig, "onUpdate"> & {
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

export class Button extends StateView {
  constructor(parent: Component, cfg: ButtonConfig) {
    super(parent, {
      states: {
        normal: cfg.normal,
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
      fallback: "normal",
      ...cfg,
    });

    this._clickable = new Clickable(this, {
      ...this._compensatePadding(),
      shape: cfg.shape,
      enabled: cfg.enabled,
      onClick: cfg.onClick,
      onUpdate: (s) => this.setState(s),
    });

    this.setState(this._clickable.state);
  }

  get enabled(): boolean {
    return this._clickable.enabled;
  }
  set enabled(v: boolean) {
    this._clickable.enabled = v;
    this.setState(this._clickable.state);
  }

  private _compensatePadding() {
    return {
      left: -this.node.xAxis.paddingStart,
      right: -this.node.xAxis.paddingEnd,
      top: -this.node.yAxis.paddingStart,
      bottom: -this.node.yAxis.paddingEnd,
    };
  }

  private readonly _clickable: Clickable;
}
