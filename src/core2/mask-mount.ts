import { GameObjects, type Scene } from "phaser";
import { resolve, type Rect } from "../layout";
import { Component } from "./component";
import type { Mount } from "./mount";
import type { Theme } from "../theme2";

export class MaskMount implements Mount {
  readonly theme: Theme;
  readonly root: Component;

  private readonly host: GameObjects.Container;
  private readonly maskRect: GameObjects.Rectangle;

  constructor(scene: Scene, theme: Theme) {
    this.theme = theme;

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
    this.maskRect.setPosition(r.x, r.y).setSize(r.w, r.h);
  }

  resolveLayout(): void {
    resolve(this.root.node);
  }
}
