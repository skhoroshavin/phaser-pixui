import { frameDimensions } from "../shared/frame";
import type { Mount } from "../mounts/mount";
import { Image, type ImageConfig } from "./image";

export type MultiImageConfig = ImageConfig & {
  frames: string[];
};

export class MultiImage extends Image {
  constructor(parent: Mount, cfg: MultiImageConfig) {
    super(parent, cfg);
    const scene = this.displayHost.scene!;
    this.node.setIntrinsicSize(
      cfg.frames
        .map((f) => frameDimensions(scene.textures.getFrame(cfg.texture, f)))
        .reduce(
          (acc, d) => ({
            width: Math.max(acc.width, d.width),
            height: Math.max(acc.height, d.height),
          }),
          { width: 0, height: 0 },
        ),
    );
  }

  setFrame(name: string): void {
    this.internal.setFrame(name);
  }
}
