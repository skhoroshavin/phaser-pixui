import type { Scene } from "phaser";
import { type DisplayHost } from "../primitives/component";
import { Mount } from "./mount";
import { resolve } from "../layout";
import type { Size } from "../shared/size";

/** {@link SceneMount} configuration. */
export type SceneMountConfig = {
  /** Returns the current viewport size. Called on every resize. */
  viewport: () => Size;
};

/**
 * Mounts a component tree to a Phaser scene. The tree is sized to the
 * viewport returned by {@link SceneMountConfig.viewport}.
 */
export class SceneMount extends Mount {
  private readonly scene: Scene;
  private readonly _viewport: () => Size;

  constructor(scene: Scene, cfg: SceneMountConfig) {
    super(scene);
    this.scene = scene;
    this._viewport = cfg.viewport;
    scene.scale.on("resize", this._resize, this);
    scene.events.once("create", () => scene.scale.refresh());
  }

  get displayHost(): DisplayHost {
    return this.scene.children;
  }

  protected doResolve(): void {
    const { width, height } = this.node.layout;
    if (width === undefined || height === undefined) resolve(this.node);
    else resolve(this.node, { x: 0, y: 0, width, height });
  }

  protected onDestroy(): void {
    super.onDestroy();
    this.scene.scale.off("resize", this._resize, this);
  }

  private _resize(): void {
    const { width, height } = this._viewport();
    this.node.layout.width = width;
    this.node.layout.height = height;
    this.resolveLayout();
  }
}
