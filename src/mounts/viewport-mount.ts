import { Mount, type DisplayHost } from "./mount";

export class ViewportMount extends Mount {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
  }

  get displayHost(): DisplayHost {
    return this.scene.children;
  }
}
