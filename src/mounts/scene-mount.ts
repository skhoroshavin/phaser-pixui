import type { Scene } from "phaser";
import { Mount, type DisplayHost } from "./mount";
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

  private _resize({ width, height }: Size): void {
    if (!this._root) return;
    this._root.layout.width = width;
    this._root.layout.height = height;
    this.resolveLayout();
  }
}
