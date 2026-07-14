import { GameObjects } from "phaser";
import { frameDimensions, type FrameDimensions } from "../shared/frame";
import { Component, type ComponentConfig } from "./component";
import { PhaserObject } from "./phaser-object";

export type ImageConfig = {
  texture: string;
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
} & ComponentConfig;

export class Image extends PhaserObject<GameObjects.Sprite | GameObjects.NineSlice> {
  constructor(parent: Component, cfg: ImageConfig) {
    const scene = parent.displayHost.scene!;
    const dims = frameDimensions(scene.textures.getFrame(cfg.texture, cfg.frame));
    super(
      parent,
      (scene) => {
        if (dims.scalableX || dims.scalableY) {
          return new GameObjects.NineSlice(
            scene,
            0,
            0,
            cfg.texture,
            cfg.frame,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            cfg.tileX,
            cfg.tileY,
          );
        }
        return new GameObjects.Sprite(scene, 0, 0, cfg.texture, cfg.frame);
      },
      cfg,
    );

    this._dims = dims;
    this.node.setIntrinsicSize(dims);
  }

  protected setSizeX(width: number): void {
    if (!this._dims.scalableX) return;
    const ns = this.internal as GameObjects.NineSlice;
    const min = this._dims.minWidth;
    ns.width = Math.max(min, width);
    ns.scaleX = Math.min(1, width / min);
  }

  protected setSizeY(height: number): void {
    if (!this._dims.scalableY) return;
    const ns = this.internal as GameObjects.NineSlice;
    const min = this._dims.minHeight;
    ns.height = Math.max(min, height);
    ns.scaleY = Math.min(1, height / min);
  }

  private readonly _dims: FrameDimensions;
}
