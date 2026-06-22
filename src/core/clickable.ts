import { Scene } from "phaser";
import { Interactive, InteractiveConfig } from "./interactive.ts";

export type ClickableConfig = {
  onClick?: () => void;
  onUpdate?: () => void;
} & InteractiveConfig;

export enum ClickableState {
  Default,
  Hovered,
  Pressed,
  Disabled,
}

export class Clickable extends Interactive {
  constructor(scene: Scene, cfg: ClickableConfig = {}) {
    super(scene, cfg);

    this._onClick = cfg.onClick;
    this._onUpdate = cfg.onUpdate;

    this.events.on("pointerdown", this._onPointerDown, this);
    this.events.on("pointerout", this._onPointerOut, this);
    this.events.on("pointerup", this._onPointerUp, this);
    this.events.on("pointerover", this._onPointerOver, this);
  }

  get state(): ClickableState {
    return this.enabled ? this._state : ClickableState.Disabled;
  }
  get hovered() {
    return this.state === ClickableState.Hovered;
  }
  get pressed() {
    return this.state === ClickableState.Pressed;
  }
  private _state: ClickableState = ClickableState.Default;

  protected override updateEnabled(enabled: boolean) {
    this._setState(enabled ? ClickableState.Default : ClickableState.Disabled);
  }

  protected override updateVisible(visible: boolean) {
    super.updateVisible(visible);
    this._setState(this.enabled ? ClickableState.Default : ClickableState.Disabled);
  }

  private _onPointerDown() {
    if (!this.enabled) return;
    this._setState(ClickableState.Pressed);
  }

  private _onPointerUp() {
    if (!this.enabled) return;
    if (this.pressed && this._onClick) this._onClick();
    this._setState(this.isDesktop ? ClickableState.Hovered : ClickableState.Default);
  }

  private _onPointerOut() {
    if (!this.enabled) return;
    this._setState(ClickableState.Default);
  }

  private _onPointerOver() {
    if (!this.enabled) return;
    if (!this.isDesktop) return;
    this._setState(ClickableState.Hovered);
  }

  private _setState(state: ClickableState) {
    if (this._state === state) return;
    this._state = state;
    if (this._onUpdate) this._onUpdate();
  }

  private readonly _onClick?: () => void;
  private readonly _onUpdate?: () => void;
}
