import { resolve } from "../layout/node";
import { Component } from "./component";
import type { ResponsiveScene } from "../scene/responsive";
import type { ResolvedTheme } from "../styled2/theme.js";

export class ViewportMount {
  constructor(scene: ResponsiveScene, theme: ResolvedTheme) {
    this.scene = scene;
    this.theme = theme;
    this.root = new Component(undefined, {
      width: scene.viewport.width,
      height: scene.viewport.height,
    });
    this.root.mount = this;
  }

  readonly root: Component;
  readonly scene: ResponsiveScene;
  readonly theme: ResolvedTheme;

  layout(): void {
    resolve(this.root.node);
  }

  resize(w: number, h: number): void {
    this.root.node.box.width = w;
    this.root.node.box.height = h;
    resolve(this.root.node);
  }
}
