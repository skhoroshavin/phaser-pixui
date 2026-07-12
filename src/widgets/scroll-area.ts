import { Math as PMath } from "phaser";
import { Scrollable } from "../behaviours/scrollable";
import { type Axis } from "../shared/axis";
import { Component, type ComponentConfig } from "../primitives/component";
import { Container } from "../primitives/container";
import { Interactive } from "../primitives/interactive";
import { MaskMount } from "../mounts/mask-mount";
import { resolve } from "../layout";
import type { Rect } from "../shared/rect";

export type ScrollAreaConfig = ComponentConfig & {
  axis?: Axis;
};

export class ScrollArea extends Component {
  constructor(parent: Component, cfg: ScrollAreaConfig = {}) {
    super(parent, cfg);

    this._axis = cfg.axis;

    const scene = this.displayHost.scene!;
    this._maskMount = new MaskMount(scene);
    this.displayHost.add(this._maskMount.displayHost);
    this.content = new Container(this._maskMount);

    this.node.onLayout = (rect, depth) => {
      this._viewport = rect;
      this._applyAxisLock();
      this._maskMount.setMaskRect(rect);
      this._maskMount.displayHost.setDepth(depth);
      resolve(this.content.node);
      this._applyScroll();
    };

    this.content.node.onLayout = () => {
      this._updateMaxScroll();
      this._clampScroll();
      this._applyScroll();
    };

    this._surface = new Interactive(this, { inset: 0 });
    this._scrollable = new Scrollable({
      axis: this._axis,
      onScroll: (dx, dy) => this.scrollBy(dx, dy),
    });
    this._surface.addBehaviour(this._scrollable);
  }

  readonly content: Container;

  get scrollX(): number {
    return this._scroll.x;
  }
  set scrollX(v: number) {
    this._scroll.x = PMath.Clamp(v, 0, this._maxScroll.x);
    this._applyScroll();
  }

  get scrollY(): number {
    return this._scroll.y;
  }
  set scrollY(v: number) {
    this._scroll.y = PMath.Clamp(v, 0, this._maxScroll.y);
    this._applyScroll();
  }

  get maxScrollX(): number {
    return this._maxScroll.x;
  }
  get maxScrollY(): number {
    return this._maxScroll.y;
  }

  scrollBy(dx: number, dy: number): void {
    this.scrollX = this._scroll.x + dx;
    this.scrollY = this._scroll.y + dy;
  }

  scrollTo(x: number, y: number): void {
    this.scrollX = x;
    this.scrollY = y;
  }

  scrollToStart(): void {
    this.scrollTo(0, 0);
  }

  scrollToEnd(): void {
    this.scrollTo(this._maxScroll.x, this._maxScroll.y);
  }

  protected onDestroy(): void {
    this._maskMount.destroy();
  }

  private _applyScroll(): void {
    if (!this._viewport) return;
    this._maskMount.displayHost.x = this._viewport.x - this._scroll.x;
    this._maskMount.displayHost.y = this._viewport.y - this._scroll.y;
  }

  private _applyAxisLock(): void {
    if (!this._viewport) return;
    if (this._axis === "y") this.content.node.layout.width = this._viewport.width;
    else if (this._axis === "x") this.content.node.layout.height = this._viewport.height;
  }

  private _updateMaxScroll(): void {
    const cr = this.content.node.rect;
    this._maxScroll.set(
      Math.max(0, cr.width - (this._viewport?.width ?? 0)),
      Math.max(0, cr.height - (this._viewport?.height ?? 0)),
    );
  }

  private _clampScroll(): void {
    this._scroll.x = PMath.Clamp(this._scroll.x, 0, this._maxScroll.x);
    this._scroll.y = PMath.Clamp(this._scroll.y, 0, this._maxScroll.y);
  }

  private readonly _axis?: Axis;
  private readonly _maskMount: MaskMount;
  private readonly _surface: Interactive;
  private readonly _scrollable: Scrollable;
  private _viewport?: Rect;
  private readonly _scroll = new PMath.Vector2();
  private readonly _maxScroll = new PMath.Vector2();
}
