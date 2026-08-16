import type { GameObjects } from "phaser";
import { Behaviour } from "./behaviour";

/** {@link Clickable} configuration. */
export type ClickableConfig = {
  /** Called when the interactive zone is clicked. */
  onClick?: () => void;
  /** Called when the pressed state changes. */
  onUpdate?: (pressed: boolean) => void;
};

/**
 * A behaviour that tracks press and click on an {@link Interactive} zone.
 */
export class Clickable extends Behaviour {
  private _pressed = false;
  private readonly _onClick?: () => void;
  private readonly _onUpdate?: (pressed: boolean) => void;

  constructor(cfg?: ClickableConfig) {
    super();
    this._onClick = cfg?.onClick;
    this._onUpdate = cfg?.onUpdate;
  }

  /** Whether the zone is currently pressed. */
  get pressed(): boolean {
    return this._pressed;
  }

  attach(zone: GameObjects.Zone): void {
    this.zone = zone;
    zone.on("pointerdown", this._onDown, this);
    zone.on("pointerup", this._onUp, this);
    zone.on("pointerout", this._onOut, this);
  }

  detach(): void {
    this.zone.off("pointerdown", this._onDown, this);
    this.zone.off("pointerup", this._onUp, this);
    this.zone.off("pointerout", this._onOut, this);
  }

  protected onActiveChange(active: boolean): void {
    if (!active && this._pressed) {
      this._pressed = false;
      this._onUpdate?.(false);
    }
  }

  private _onDown(): void {
    if (!this.active) return;
    this._pressed = true;
    this._onUpdate?.(true);
  }

  private _onUp(): void {
    if (!this.active || !this._pressed) return;
    this._pressed = false;
    this._onClick?.();
    this._onUpdate?.(false);
  }

  private _onOut(): void {
    if (!this.active || !this._pressed) return;
    this._pressed = false;
    this._onUpdate?.(false);
  }
}
