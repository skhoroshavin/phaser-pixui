import type { GameObjects } from "phaser";

export abstract class Behaviour {
  protected zone!: GameObjects.Zone;
  private _active = true;

  abstract attach(zone: GameObjects.Zone): void;
  abstract detach(): void;

  setActive(active: boolean): void {
    if (this._active === active) return;
    this._active = active;
    this.onActiveChange(active);
  }

  protected onActiveChange(_active: boolean): void {}

  protected get active(): boolean {
    return this._active;
  }
}
