import type { GameObjects } from "phaser";
import { Scene } from "phaser";
import { Component, ComponentConfig } from "./component.ts";

type GameObject = GameObjects.GameObject;
type Transform = GameObjects.Components.Transform;
type Origin = GameObjects.Components.Origin;
type Visible = GameObjects.Components.Visible;
type Filters = GameObjects.Components.Filters;

export type RenderableConfig = ComponentConfig & {
  tint?: number;
};

export interface Tint {
  isTinted: boolean;
  tint: number;
  setTint(color: number): void;
  clearTint(): void;
}

export class Renderable<
  Internal extends GameObject & Transform & Origin & Visible & Filters & Tint,
> extends Component {
  constructor(scene: Scene, cfg: RenderableConfig | undefined, internal: Internal) {
    super(scene, cfg);
    this.internal = internal;
    this.tint = cfg?.tint;
  }
  readonly internal: Internal;

  protected override updateVisible(visible: boolean) {
    this.internal.visible = visible;
  }

  get tint(): number | undefined {
    return this.internal.isTinted ? this.internal.tint : undefined;
  }
  set tint(value: number | undefined) {
    if (value === undefined) this.internal.clearTint();
    else this.internal.setTint(value);
  }

  override bringToTop() {
    this.scene.children.bringToTop(this.internal);
  }

  protected override updatePosition() {
    this.internal.setOrigin(this.originX, this.originY);
    this.internal.setPosition(this.x, this.y);
  }
}
