import { type BoxConfig } from "../layout/node";
import { frameDimensions } from "../util/frame";
import { Component } from "./component";
import { Renderable } from "./renderable";

export type ImageConfig = {
  texture: string;
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
} & BoxConfig;

export class Image extends Renderable<Phaser.GameObjects.Sprite | Phaser.GameObjects.NineSlice> {
  constructor(parent: Component, cfg: ImageConfig) {
    const scene = parent.mount.scene;
    const dims = frameDimensions(scene.textures.getFrame(cfg.texture, cfg.frame));
    const scalable = dims.scalableX || dims.scalableY;

    if (scalable) {
      const inner = Image._createNineSlice(scene, cfg);
      super(parent, inner, cfg);
      Image._wireNineSlice(this, inner, dims.scalableX, dims.scalableY);
    } else {
      super(parent, scene.add.sprite(0, 0, cfg.texture, cfg.frame), cfg);
    }
  }

  private static _createNineSlice(
    scene: Phaser.Scene,
    cfg: ImageConfig,
  ): Phaser.GameObjects.NineSlice {
    const inner = scene.make.nineslice({
      key: cfg.texture,
      frame: cfg.frame,
      tileX: cfg.tileX,
      tileY: cfg.tileY,
    });
    scene.children.add(inner);
    return inner;
  }

  private static _wireNineSlice(
    image: Image,
    nineSlice: Phaser.GameObjects.NineSlice,
    scalableX: boolean,
    scalableY: boolean,
  ): void {
    const origLayout = image.node.onLayout;
    image.node.onLayout = (rect) => {
      origLayout?.(rect);
      if (scalableX) nineSlice.width = rect.w;
      if (scalableY) nineSlice.height = rect.h;
    };
  }
}
