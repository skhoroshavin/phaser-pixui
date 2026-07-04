import type { GameObjects } from "phaser";
import type { Node } from "../layout";
import { resolve } from "../layout";

export type DisplayHost = GameObjects.DisplayList | GameObjects.Container;

export abstract class Mount {
  abstract get displayHost(): DisplayHost;

  protected _root?: Node;

  setRootNode(node: Node): void {
    this._root = node;
  }

  resolveLayout(): void {
    if (this._root) resolve(this._root);
  }
}
