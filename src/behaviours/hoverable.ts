import type { GameObjects } from "phaser";
import { Behaviour } from "./behaviour";

export type HoverableConfig = {
  onUpdate?: (hovered: boolean) => void;
};

export class Hoverable extends Behaviour {
  private _hovered = false;
  private readonly _onUpdate?: (hovered: boolean) => void;
  private _isDesktop = false;

  constructor(cfg?: HoverableConfig) {
    super();
    this._onUpdate = cfg?.onUpdate;
  }

  get hovered(): boolean {
    return this._hovered;
  }

  attach(zone: GameObjects.Zone): void {
    this.zone = zone;
    this._isDesktop = zone.scene!.sys.game.device.os.desktop;
    zone.on("pointerover", this._onOver, this);
    zone.on("pointerout", this._onOut, this);
  }

  detach(): void {
    this.zone.off("pointerover", this._onOver, this);
    this.zone.off("pointerout", this._onOut, this);
  }

  protected onActiveChange(active: boolean): void {
    if (!active && this._hovered) {
      this._hovered = false;
      this._onUpdate?.(false);
    }
  }

  private _onOver(): void {
    if (!this.active || !this._isDesktop) return;
    this._hovered = true;
    this._onUpdate?.(true);
  }

  private _onOut(): void {
    if (!this.active || !this._hovered) return;
    this._hovered = false;
    this._onUpdate?.(false);
  }
}
