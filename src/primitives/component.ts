import type { GameObjects } from "phaser";
import { Node, type Layout } from "../layout";

/** A Phaser display list or container that hosts component game objects. */
export type DisplayHost = GameObjects.DisplayList | GameObjects.Container;

/** {@link Component} configuration. */
export type ComponentConfig = Layout & {
  /** Initial visibility. Defaults to `true`. */
  visible?: boolean;
};

/**
 * Base class for all UI components.
 *
 * Components form a tree, mirror layout properties to a layout {@link Node},
 * and manage the lifecycle of their game objects. Use {@link Component.add}
 * to build component trees.
 */
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

  /**
   * Adds a child component. Accepts a component class and its config, or any
   * factory function of the form `(parent, ...args) => Component`.
   */
  add<T, A extends unknown[]>(Ctor: ComponentCtor<T, A>, ...args: NoInfer<A>): T {
    return Ctor.prototype
      ? new (Ctor as new (parent: Component, ...a: A) => T)(this, ...args)
      : (Ctor as (parent: Component, ...args: A) => T)(this, ...args);
  }

  /** Destroys the component, its children, and their game objects. */
  destroy(): void {
    if (this._destroyed) return;
    this._destroy();
    if (this._root !== this) this._root.resolveLayout();
  }

  /** The display host this component tree is attached to. */
  get displayHost(): DisplayHost {
    return this._root.displayHost;
  }

  /** Marks the component tree dirty, scheduling layout resolution before rendering the frame. */
  resolveLayout(): void {
    this._root.resolveLayout();
  }

  /** Visibility of this component, also taking into account parent visibility. */
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

/**
 * Component class (constructed with `(parent, ...args)`), or a factory
 * function of the same shape.
 */
export type ComponentCtor<T, A extends unknown[]> =
  | (new (parent: Component, ...args: A) => T)
  | ((parent: Component, ...args: A) => T);
