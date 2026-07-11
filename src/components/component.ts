import { Node, type Layout } from "../layout";
import { Mount, type DisplayHost } from "../mounts/mount";

export type ComponentConfig = Layout & {
  visible?: boolean;
};

export class Component extends Mount {
  constructor(parent: Mount, cfg?: ComponentConfig) {
    super(new Node({ layout: cfg }));
    this._visible = cfg?.visible ?? true;
    if (parent instanceof Component) {
      this._mount = parent._mount;
      parent._attach(this);
    } else {
      this._mount = parent;
      this._mount.node.add(this.node);
    }
  }

  get displayHost(): DisplayHost {
    return this._mount.displayHost;
  }

  resolveLayout(): void {
    this._mount.resolveLayout();
  }

  get visible(): boolean {
    return this._visible && this._parentVisible;
  }

  set visible(v: boolean) {
    if (v === this._visible) return;
    this._visible = v;
    this._syncVisibility();
  }

  protected onVisibilityChange(_visible: boolean): void {
    // override in subclasses
  }

  protected children: Component[] = [];
  private readonly _mount: Mount;
  private _visible: boolean;
  private _parentVisible: boolean = true;

  private _attach(child: Component): void {
    this.children.push(child);
    this.node.add(child.node);
    child._parentVisible = this.visible;
  }

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
