import { createNode, type Layout, type Node } from "../layout";
import type { ViewportMount } from "./viewport-mount";

export type ComponentConfig = Layout & {
  visible?: boolean;
};

export class Component {
  constructor(parent: Component | undefined, cfg?: ComponentConfig) {
    this.node = createNode({ layout: cfg });
    this._visible = cfg?.visible ?? true;
    if (parent) {
      this.mount = parent.mount;
      parent.addChild(this);
    }
  }

  readonly node: Node;
  mount!: ViewportMount;

  get visible(): boolean {
    return this._visible && this._parentVisible;
  }

  set visible(v: boolean) {
    if (v === this._visible) return;
    this._visible = v;
    this._syncVisibility();
  }

  protected addChild(child: Component): void {
    this._children.push(child);
    this.node.children.push(child.node);
    child._parentVisible = this.visible;
  }

  protected onVisibilityChange(_visible: boolean): void {
    // override in subclasses
  }

  private _children: Component[] = [];
  private _visible: boolean;
  private _parentVisible: boolean = true;

  private _setParentVisible(v: boolean): void {
    if (v === this._parentVisible) return;
    this._parentVisible = v;
    this._syncVisibility();
  }

  private _syncVisibility(): void {
    this.onVisibilityChange(this.visible);
    for (const child of this._children) {
      child._setParentVisible(this.visible);
    }
  }
}
