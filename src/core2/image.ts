import { type BoxConfig } from "../layout/node";
import { frameDimensions } from "../util/frame";
import { Renderable } from "./renderable";
import type { ViewportMount } from "./viewport-mount";

export type ImageConfig = {
  texture: string;
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
} & BoxConfig;

export class Image extends Renderable<Phaser.GameObjects.Sprite | Phaser.GameObjects.NineSlice> {
  constructor(mount: ViewportMount, cfg: ImageConfig) {
    const dims = frameDimensions(mount.scene.textures.getFrame(cfg.texture, cfg.frame));
    const scalable = dims.scalableX || dims.scalableY;

    if (scalable) {
      const inner = Image._createNineSlice(mount, cfg);
      super(mount, inner, cfg);
      Image._wireNineSlice(this, inner, dims.scalableX, dims.scalableY);
    } else {
      super(mount, mount.scene.add.sprite(0, 0, cfg.texture, cfg.frame), cfg);
    }
  }

  private static _createNineSlice(
    mount: ViewportMount,
    cfg: ImageConfig,
  ): Phaser.GameObjects.NineSlice {
    const inner = mount.scene.make.nineslice({
      key: cfg.texture,
      frame: cfg.frame,
      tileX: cfg.tileX,
      tileY: cfg.tileY,
    });
    mount.scene.displayList.add(inner);
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
