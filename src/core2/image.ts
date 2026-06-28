import { GameObjects } from "phaser";
import { frameDimensions } from "../util/frame";
import { Component, type ComponentConfig } from "./component";
import { Renderable } from "./renderable";

export type ImageConfig = {
  texture: string;
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
} & ComponentConfig;

export class Image extends Renderable<GameObjects.Sprite | GameObjects.NineSlice> {
  constructor(parent: Component, cfg: ImageConfig) {
    let dims!: ReturnType<typeof frameDimensions>;
    super(
      parent,
      (scene) => {
        dims = frameDimensions(scene.textures.getFrame(cfg.texture, cfg.frame));
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
      {
        ...cfg,
        onResize: (i, w, h) => {
          if (dims.scalableX || dims.scalableY) {
            const ns = i as GameObjects.NineSlice;
            if (dims.scalableX) ns.width = w;
            if (dims.scalableY) ns.height = h;
          }
        },
      },
    );

    this.node.setIntrinsicSize({
      w: dims.scalableX ? 0 : dims.width,
      h: dims.scalableY ? 0 : dims.height,
    });
  }
}
