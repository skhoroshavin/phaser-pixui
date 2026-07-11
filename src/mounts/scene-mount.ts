import type { Scene } from "phaser";
import { Mount, type DisplayHost } from "./mount";
import { resolve } from "../layout";
import type { Size } from "../shared/size";

export type SceneMountConfig = {
  viewport: () => Size;
};

export class SceneMount extends Mount {
  private readonly scene: Scene;

  constructor(scene: Scene, cfg: SceneMountConfig) {
    super();
    this.scene = scene;

    const resize = () => this._resize(cfg.viewport());
    scene.scale.on("resize", resize);
    scene.events.once("create", () => scene.scale.refresh());
    scene.events.once("shutdown", () => scene.scale.off("resize", resize));
  }

  get displayHost(): DisplayHost {
    return this.scene.children;
  }

  resolveLayout(): void {
    const { width, height } = this.node.layout;
    if (width === undefined || height === undefined) {
      resolve(this.node);
      return;
    }
    resolve(this.node, { x: 0, y: 0, width, height });
  }

  private _resize({ width, height }: Size): void {
    this.node.layout.width = width;
    this.node.layout.height = height;
    this.resolveLayout();
  }
}
