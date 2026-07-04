import { resolve } from "../layout";
import { Component } from "../core/component";
import type { DisplayHost, Mount } from "../core/mount";

export class ViewportMount implements Mount {
  readonly root: Component;
  readonly atlas: string;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, atlas: string, width: number, height: number) {
    this.scene = scene;
    this.atlas = atlas;
    this.root = new Component(undefined, { width, height, mount: this });
  }

  get displayHost(): DisplayHost {
    return this.scene.children;
  }

  resolveLayout(): void {
    resolve(this.root.node);
  }

  resize(width: number, height: number): void {
    this.root.node.layout.width = width;
    this.root.node.layout.height = height;
    resolve(this.root.node);
  }
}
