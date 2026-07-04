import { GameObjects, type Scene } from "phaser";
import { resolve, type Rect } from "../layout";
import { Component } from "./component";
import type { Mount } from "./mount";

export class MaskMount implements Mount {
  readonly atlas: string;
  readonly root: Component;

  private readonly host: GameObjects.Container;
  private readonly maskRect: GameObjects.Rectangle;

  constructor(scene: Scene, atlas: string) {
    this.atlas = atlas;

    this.host = new GameObjects.Container(scene, 0, 0);

    this.maskRect = new GameObjects.Rectangle(scene, 0, 0, 0, 0);
    this.maskRect.setOrigin(0, 0);
    this.maskRect.setFillStyle(0);
    this.host.enableFilters();
    this.host.filters!.external.addMask(this.maskRect, false);

    this.root = new Component(undefined, { mount: this });
  }

  get displayHost(): GameObjects.Container {
    return this.host;
  }

  setMaskRect(r: Rect): void {
    this.maskRect.setPosition(r.x, r.y).setSize(r.width, r.height);
  }

  resolveLayout(): void {
    resolve(this.root.node);
  }
}
