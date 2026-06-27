import { resolve } from "../layout";
import { Component } from "../core2/component";
import type { DisplayHost, Mount } from "../core2/mount";
import type { Theme } from "../theme2";

export class ViewportMount implements Mount {
  readonly root: Component;
  readonly theme: Theme;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, theme: Theme, width: number, height: number) {
    this.scene = scene;
    this.theme = theme;
    this.root = new Component(undefined, { width, height, mount: this });
  }

  get displayHost(): DisplayHost {
    return this.scene.children;
  }

  layout(): void {
    resolve(this.root.node);
  }

  resize(w: number, h: number): void {
    this.root.node.layout.width = w;
    this.root.node.layout.height = h;
    resolve(this.root.node);
  }
}
