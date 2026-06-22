import { createNode, resolve, type Node } from "../layout/node";
import type { ResponsiveScene } from "../scene/responsive";

export class ViewportMount {
  constructor(scene: ResponsiveScene) {
    this.scene = scene;
    this.root = createNode({ box: { width: scene.viewport.width, height: scene.viewport.height } });
  }

  readonly root: Node;
  readonly scene: ResponsiveScene;

  layout(): void {
    resolve(this.root);
  }

  resize(w: number, h: number): void {
    this.root.box.width = w;
    this.root.box.height = h;
    resolve(this.root);
  }
}
