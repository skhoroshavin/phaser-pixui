import { Scene } from "phaser";
import { Origin, OriginX, OriginY } from "../util/origin.ts";
import { Anchor, Component, ComponentConfig } from "./component.ts";
import type { Mask } from "./mask.ts";

export class Container extends Component {
  constructor(scene: Scene, cfg?: ComponentConfig) {
    super(scene, cfg);
  }

  attach(component: Component, originX?: OriginX, originY?: OriginY) {
    originX ??= OriginX.Center;
    originY ??= OriginY.Center;
    this._children.push({ originX, originY, component });
  }
  private _children: ({ component: Component } & Origin)[] = [];

  override initialize() {
    super.initialize();
    for (const item of this._children) {
      item.component.initialize();
    }
  }

  protected override updateVisible(visible: boolean) {
    for (const item of this._children) {
      item.component.setParentVisible(visible);
    }
  }

  protected override updateEnabled(enabled: boolean) {
    for (const item of this._children) {
      item.component.setParentEnabled(enabled);
    }
  }

  protected override updatePosition() {
    const anchors = new Map<number, Anchor>();
    for (const item of this._children) {
      const key = item.originX * 10 + item.originY;
      let anchor = anchors.get(key);
      if (!anchor) {
        anchor = {
          x: this.left + Math.floor(item.originX * this.width),
          y: this.top + Math.floor(item.originY * this.height),
          width: this.width,
          height: this.height,
          originX: item.originX,
          originY: item.originY,
        };
        anchors.set(key, anchor);
      }
      item.component.reposition(anchor, this.zoom);
    }
  }

  override setMask(mask: Mask) {
    for (const item of this._children) {
      item.component.setMask(mask);
    }
  }

  override bringToTop() {
    for (const item of this._children) {
      item.component.bringToTop();
    }
  }
}
