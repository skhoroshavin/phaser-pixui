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
    this._scroll.x = PMath.Clamp(v, 0, this._maxScroll().x);
    this._applyScroll();
  }

  get scrollY(): number {
    return this._scroll.y;
  }
  set scrollY(v: number) {
    this._scroll.y = PMath.Clamp(v, 0, this._maxScroll().y);
    this._applyScroll();
  }

  scrollBy(dx: number, dy: number): void {
    this._stopChase();
    this.scrollX = this._scroll.x + dx;
    this.scrollY = this._scroll.y + dy;
  }

  scrollTo(x: number, y: number): void {
    this._chaseTo(() => ({ x, y }));
  }

  scrollToStart(): void {
    this.scrollTo(0, 0);
  }

  scrollToEnd(): void {
    this._chaseTo(() => this._maxScroll());
  }

  protected onDestroy(): void {
    this._stopChase();
    this._maskMount.destroy();
  }

  private _chaseTo(target: () => ScrollTarget): void {
    this._target = target;
    if (this._chasing) return;
    this._chasing = true;
    this.displayHost.scene!.events.on("update", this._stepChase, this);
  }

  private _stopChase(): void {
    if (!this._chasing) return;
    this._chasing = false;
    this.displayHost.scene!.events.off("update", this._stepChase, this);
  }

  private _stepChase(_time: number, delta: number): void {
    const k = 1 - Math.exp(-delta / SCROLL_TAU);
    const t = this._target();
    this.scrollX += (t.x - this.scrollX) * k;
    this.scrollY += (t.y - this.scrollY) * k;
    if (Math.abs(t.x - this.scrollX) < 0.5 && Math.abs(t.y - this.scrollY) < 0.5) {
      this.scrollX = t.x;
      this.scrollY = t.y;
      this._stopChase();
    }
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

  private _clampScroll(): void {
    const m = this._maxScroll();
    this._scroll.x = PMath.Clamp(this._scroll.x, 0, m.x);
    this._scroll.y = PMath.Clamp(this._scroll.y, 0, m.y);
  }

  private _maxScroll(): ScrollTarget {
    const cr = this.content.node.rect;
    const vp = this._viewport;
    return {
      x: Math.max(0, cr.width - (vp?.width ?? 0)),
      y: Math.max(0, cr.height - (vp?.height ?? 0)),
    };
  }

  private readonly _axis?: Axis;
  private readonly _maskMount: MaskMount;
  private readonly _surface: Interactive;
  private readonly _scrollable: Scrollable;
  private _viewport?: Rect;
  private readonly _scroll = new PMath.Vector2();
  private _target: () => ScrollTarget = () => ({ x: 0, y: 0 });
  private _chasing = false;
}

type ScrollTarget = { x: number; y: number };

const SCROLL_TAU = 60;
