import type { GameObjects } from "phaser";
import { Node } from "../layout";

export type DisplayHost = GameObjects.DisplayList | GameObjects.Container;

export abstract class Mount {
  readonly node: Node;

  protected constructor(node: Node = new Node()) {
    this.node = node;
  }

  abstract get displayHost(): DisplayHost;

  abstract resolveLayout(): void;

  add<T, A extends unknown[]>(Ctor: ComponentCtor<T, A>, ...args: NoInfer<A>): T {
    return Ctor.prototype
      ? new (Ctor as new (parent: Mount, ...a: A) => T)(this, ...args)
      : (Ctor as (parent: Mount, ...args: A) => T)(this, ...args);
  }
}

export type ComponentCtor<T, A extends unknown[]> =
  | (new (parent: Mount, ...args: A) => T)
  | ((parent: Mount, ...args: A) => T);
