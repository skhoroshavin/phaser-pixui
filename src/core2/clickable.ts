import { Interactive, type InteractiveConfig } from "./interactive";
import { Component } from "./component";

export type ClickableConfig = InteractiveConfig & {
  onClick?: () => void;
  onUpdate?: (state: ClickableState) => void;
};

export type ClickableState = "normal" | "pressed" | "hover" | "disabled";

export class Clickable extends Interactive {
  constructor(parent: Component, cfg: ClickableConfig = {}) {
    super(parent, cfg);

    this._onClick = cfg.onClick;
    this._onUpdate = cfg.onUpdate;

    const isDesktop = parent.mount.scene.sys.game.device.os.desktop;

    this._zone.on("pointerdown", () => {
      if (!this.enabled) return;
      this._setState("pressed");
    });

    this._zone.on("pointerup", () => {
      if (!this.enabled) return;
      if (this.state === "pressed" && this._onClick) {
        this._onClick();
      }
      this._setState(isDesktop ? "hover" : "normal");
    });

    this._zone.on("pointerover", () => {
      if (!this.enabled) return;
      if (!isDesktop) return;
      this._setState("hover");
    });

    this._zone.on("pointerout", () => {
      if (!this.enabled) return;
      this._setState("normal");
    });
  }

  get state(): ClickableState {
    return this.enabled ? this._state : "disabled";
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (v) this._setState("normal");
  }

  private _setState(s: ClickableState): void {
    if (this._state === s) return;
    this._state = s;
    this._onUpdate?.(this._state);
  }

  private _state: ClickableState = "normal";
  private readonly _onClick?: () => void;
  private readonly _onUpdate?: (state: ClickableState) => void;
}
