import type { BoxConfig } from "../layout";
import { Component } from "../core2/component.js";
import { Frame } from "./frame.js";

export type ControlFrameConfig = BoxConfig & {
  style: ControlFrameStyle;
};

export type ControlState = "normal" | "hover" | "pressed" | "disabled";

export type ControlFrameStyle = {
  normal?: string;
  hover?: string;
  pressed?: string;
  disabled?: string;
};

export class ControlFrame extends Component {
  constructor(parent: Component, cfg: ControlFrameConfig) {
    super(parent, cfg);

    const baseStyle = cfg.style.normal ?? "";
    const normal = new Frame(this, { style: baseStyle, inset: 0 });
    this._frames = [normal];
    this._stateFrames = { normal, hover: normal, pressed: normal, disabled: normal };

    if (cfg.style.hover && cfg.style.hover !== baseStyle) {
      this._stateFrames.hover = new Frame(this, { style: cfg.style.hover, inset: 0 });
      this._frames.push(this._stateFrames.hover);
    }
    if (cfg.style.pressed && cfg.style.pressed !== baseStyle) {
      this._stateFrames.pressed = new Frame(this, { style: cfg.style.pressed, inset: 0 });
      this._frames.push(this._stateFrames.pressed);
    }
    if (cfg.style.disabled && cfg.style.disabled !== baseStyle) {
      this._stateFrames.disabled = new Frame(this, { style: cfg.style.disabled, inset: 0 });
      this._frames.push(this._stateFrames.disabled);
    }

    this._update();
  }

  get state(): ControlState {
    return this._state;
  }
  set state(s: ControlState) {
    if (s === this._state) return;
    this._state = s;
    this._update();
  }

  private _update(): void {
    const active = this._stateFrames[this._state];
    for (const f of this._frames) {
      f.inner.setVisible(f === active);
    }
  }

  private _state: ControlState = "normal";
  private readonly _frames: Frame[];
  private readonly _stateFrames: Record<ControlState, Frame>;
}
