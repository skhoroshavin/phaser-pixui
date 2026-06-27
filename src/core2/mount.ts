import type { GameObjects } from "phaser";
import type { Theme } from "../theme2";

export type DisplayHost = GameObjects.DisplayList | GameObjects.Container;

export interface Mount {
  readonly theme: Theme;
  readonly displayHost: DisplayHost;
}
