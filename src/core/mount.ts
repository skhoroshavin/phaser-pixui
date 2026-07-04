import type { GameObjects } from "phaser";

export type DisplayHost = GameObjects.DisplayList | GameObjects.Container;

export interface Mount {
  readonly atlas: string;
  readonly displayHost: DisplayHost;
  resolveLayout(): void;
}
