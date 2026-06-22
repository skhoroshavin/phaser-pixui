import { createNode, resolve, type Node } from "../layout/node";
import type { ResponsiveScene } from "../scene/responsive";

export class ViewportMount {
  readonly root: Node;
  readonly scene: ResponsiveScene;

  constructor(scene: ResponsiveScene) {
    this.scene = scene;
    this.root = createNode({ box: { width: scene.viewport.width, height: scene.viewport.height } });
  }

  layout(): void {
    resolve(this.root);
  }

  resize(w: number, h: number): void {
    this.root.box.width = w;
    this.root.box.height = h;
    resolve(this.root);
  }
}
