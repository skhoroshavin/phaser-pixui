import type { GameObjects } from "phaser";
import { Node, type Layout } from "../layout";

export type DisplayHost = GameObjects.DisplayList | GameObjects.Container;

export type ComponentConfig = Layout & {
  visible?: boolean;
};

export abstract class Component {
  readonly node: Node;

  protected constructor(parent?: Component, cfg?: ComponentConfig) {
    this.node = new Node({ layout: cfg });
    this._parent = parent;
    this._root = parent ? parent._root : this;
    this._visible = cfg?.visible ?? true;
    if (parent) {
      parent._children.push(this);
      parent.node.add(this.node);
      this._parentVisible = parent.visible;
    }
  }

  add<T, A extends unknown[]>(Ctor: ComponentCtor<T, A>, ...args: NoInfer<A>): T {
    return Ctor.prototype
      ? new (Ctor as new (parent: Component, ...a: A) => T)(this, ...args)
      : (Ctor as (parent: Component, ...args: A) => T)(this, ...args);
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroy();
    if (this._root !== this) this._root.resolveLayout();
  }

  get displayHost(): DisplayHost {
    return this._root.displayHost;
  }

  resolveLayout(): void {
    this._root.resolveLayout();
  }

  get visible(): boolean {
    return this._visible && this._parentVisible;
  }

  set visible(v: boolean) {
    if (v === this._visible) return;
    this._visible = v;
    this._syncVisibility();
  }

  protected onDestroy(): void {
    // override in subclasses
  }

  protected onVisibilityChange(_visible: boolean): void {
    // override in subclasses
  }

  protected _children: Component[] = [];
  protected readonly _root: Component;
  protected readonly _parent: Component | undefined;

  private _destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    this._parent?.node.remove(this.node);
    if (this._parent) {
      const i = this._parent._children.indexOf(this);
      if (i >= 0) this._parent._children.splice(i, 1);
    }
    for (const c of [...this._children]) c._destroy();
    this.onDestroy();
    this.node.onLayout = undefined;
  }

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

  private _visible: boolean;
  private _parentVisible: boolean = true;
  private _destroyed = false;
}

export type ComponentCtor<T, A extends unknown[]> =
  | (new (parent: Component, ...args: A) => T)
  | ((parent: Component, ...args: A) => T);
