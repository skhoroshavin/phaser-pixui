import { Interactive, type InteractiveConfig } from "./interactive";
import { Component } from "./component.ts";

export type ClickableConfig = InteractiveConfig & {
  onClick?: () => void;
  onUpdate?: () => void;
};

export enum ClickState {
  Default,
  Hovered,
  Pressed,
  Disabled,
}

export class Clickable extends Interactive {
  constructor(parent: Component, cfg: ClickableConfig = {}) {
    super(parent, cfg);

    this._onClick = cfg.onClick;
    this._onUpdate = cfg.onUpdate;

    const isDesktop = parent.mount.scene.sys.game.device.os.desktop;

    this._zone.on("pointerdown", () => {
      if (!this.enabled) return;
      this._setState(ClickState.Pressed);
    });

    this._zone.on("pointerup", () => {
      if (!this.enabled) return;
      if (this.state === ClickState.Pressed && this._onClick) {
        this._onClick();
      }
      this._setState(isDesktop ? ClickState.Hovered : ClickState.Default);
    });

    this._zone.on("pointerover", () => {
      if (!this.enabled) return;
      if (!isDesktop) return;
      this._setState(ClickState.Hovered);
    });

    this._zone.on("pointerout", () => {
      if (!this.enabled) return;
      this._setState(ClickState.Default);
    });
  }

  get state(): ClickState {
    return this.enabled ? this._state : ClickState.Disabled;
  }

  set visible(v: boolean) {
    super.visible = v;
    this._setState(ClickState.Default);
  }

  private _setState(s: ClickState): void {
    if (this._state === s) return;
    this._state = s;
    this._onUpdate?.();
  }

  private _state: ClickState = ClickState.Default;
  private readonly _onClick?: () => void;
  private readonly _onUpdate?: () => void;
}
