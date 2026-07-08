import { Node, type Layout } from "../layout";
import type { Mount } from "../mounts/mount";

export type ComponentConfig = Layout & {
  visible?: boolean;
};

export class Component {
  constructor(parent: Component | Mount, cfg?: ComponentConfig) {
    this.node = new Node({ layout: cfg });
    this._visible = cfg?.visible ?? true;
    if (parent instanceof Component) {
      this.mount = parent.mount;
      parent.addChild(this);
    } else {
      this.mount = parent;
      this.mount.setRootNode(this.node);
    }
  }

  public add<T extends Component, Args extends unknown[]>(
    ChildClass:
      | (new (parent: Component, ...args: Args) => T)
      | ((parent: Component, ...args: Args) => T),
    ...args: Args
  ): T {
    return ChildClass.prototype
      ? new (ChildClass as new (parent: Component, ...a: Args) => T)(this, ...args)
      : (ChildClass as (parent: Component, ...args: Args) => T)(this, ...args);
  }

  readonly node: Node;
  readonly mount: Mount;

  get visible(): boolean {
    return this._visible && this._parentVisible;
  }

  set visible(v: boolean) {
    if (v === this._visible) return;
    this._visible = v;
    this._syncVisibility();
  }

  protected addChild(child: Component): void {
    this.children.push(child);
    this.node.add(child.node);
    child._parentVisible = this.visible;
  }

  protected onVisibilityChange(_visible: boolean): void {
    // override in subclasses
  }

  protected children: Component[] = [];
  private _visible: boolean;
  private _parentVisible: boolean = true;

  private _setParentVisible(v: boolean): void {
    if (v === this._parentVisible) return;
    this._parentVisible = v;
    this._syncVisibility();
  }

  private _syncVisibility(): void {
    this.onVisibilityChange(this.visible);
    for (const child of this.children) {
      child._setParentVisible(this.visible);
    }
  }
}
