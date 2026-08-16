import type { GameObjects } from "phaser";

/**
 * Base class for input behaviours attached to {@link Interactive} components.
 * Behaviours are activated and deactivated together with their component.
 */
export abstract class Behaviour {
  protected zone!: GameObjects.Zone;
  private _active = true;

  /** Attaches this behaviour to Phaser interactive zone. */
  abstract attach(zone: GameObjects.Zone): void;

  /** Detaches this behaviour from its interactive zone. */
  abstract detach(): void;

  /**
   * Activates or deactivates this behaviour. Inactive behaviour ignores
   * all input events.
   */
  setActive(active: boolean): void {
    if (this._active === active) return;
    this._active = active;
    this.onActiveChange(active);
  }

  /** Whether this behaviour is active. */
  get active(): boolean {
    return this._active;
  }

  protected onActiveChange(_active: boolean): void {}
}
