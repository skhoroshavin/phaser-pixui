import { resolve } from "../layout";
import { Component } from "./component";
import type { Theme } from "../theme2";

export class ViewportMount {
  constructor(scene: Phaser.Scene, theme: Theme, width: number, height: number) {
    this.scene = scene;
    this.theme = theme;
    this.root = new Component(undefined, { width, height });
    this.root.mount = this;
  }

  readonly root: Component;
  readonly scene: Phaser.Scene;
  readonly theme: Theme;

  layout(): void {
    resolve(this.root.node);
  }

  resize(w: number, h: number): void {
    this.root.node.layout.width = w;
    this.root.node.layout.height = h;
    resolve(this.root.node);
  }
}
