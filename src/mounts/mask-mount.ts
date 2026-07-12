import { GameObjects, type Scene } from "phaser";
import type { Rect } from "../shared/rect";
import { Mount } from "./mount";
import { resolve } from "../layout";

export class MaskMount extends Mount {
  private readonly host: GameObjects.Container;
  private readonly maskRect: GameObjects.Rectangle;

  constructor(scene: Scene) {
    super(scene);
    this.host = new GameObjects.Container(scene, 0, 0);

    this.maskRect = new GameObjects.Rectangle(scene, 0, 0, 0, 0);
    this.maskRect.setOrigin(0, 0);
    this.maskRect.setFillStyle(0);
    this.host.enableFilters();
    this.host.filters!.external.addMask(this.maskRect, false);
  }

  setMaskRect(r: Rect): void {
    this.maskRect.setPosition(r.x, r.y).setSize(r.width, r.height);
  }

  get displayHost(): GameObjects.Container {
    return this.host;
  }

  protected doResolve(): void {
    resolve(this.node);
  }

  protected onDestroy(): void {
    super.onDestroy();
    this.host.destroy(true);
    this.maskRect.destroy();
  }
}
