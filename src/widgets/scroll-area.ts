import { Math as PMath } from "phaser";
import { Scrollable } from "../behaviours/scrollable";
import { type Axis } from "../shared/axis";
import { Component, type ComponentConfig } from "../primitives/component";
import { Container } from "../primitives/container";
import { Interactive } from "../primitives/interactive";
import { MaskMount } from "../mounts/mask-mount";
import { resolve } from "../layout";
import type { Rect } from "../shared/rect";

/** {@link ScrollArea} configuration. */
export type ScrollAreaConfig = ComponentConfig & {
  /** Scroll axis. Locks the content size on the other axis to the viewport size. */
  axis?: Axis;
};

/**
 * A scrollable viewport around its {@link ScrollArea.content} container. Content
 * larger than the viewport can be scrolled by dragging, with inertia.
 */
export class ScrollArea extends Component {
  constructor(parent: Component, cfg: ScrollAreaConfig = {}) {
    super(parent, cfg);

    this._axis = cfg.axis;

    const scene = this.displayHost.scene!;
    this._maskMount = new MaskMount(scene);
    this._maskMount.visible = this.visible;
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
      onScroll: (dx, dy) => this._scrollBy(dx, dy),
    });
    this._surface.addBehaviour(this._scrollable);
  }

  /** Scrolled content container. */
  readonly content: Container;

  /** Current horizontal scroll offset. */
  get scrollX(): number {
    return this._scroll.x;
  }

  /** Current vertical scroll offset. */
  get scrollY(): number {
    return this._scroll.y;
  }

  /** Smoothly scrolls to the given position, clamped to the valid range. */
  scrollTo(x: number, y: number): void {
    this._chaseTo(() => ({ x, y }));
  }

  /** Smoothly scrolls to the start of the content. */
  scrollToStart(): void {
    this.scrollTo(0, 0);
  }

  /** Smoothly scrolls to the end of the content. */
  scrollToEnd(): void {
    this._chaseTo(() => this._maxScroll());
  }

  protected onDestroy(): void {
    this._stopChase();
    this._maskMount.destroy();
  }

  protected onVisibilityChange(visible: boolean) {
    super.onVisibilityChange(visible);
    this._maskMount.visible = visible;
  }

  private _setScroll(x: number, y: number): void {
    this._scroll.x = PMath.Clamp(x, 0, this._maxScroll().x);
    this._scroll.y = PMath.Clamp(y, 0, this._maxScroll().y);
    this._applyScroll();
  }

  private _scrollBy(dx: number, dy: number): void {
    this._stopChase();
    this._setScroll(this._scroll.x + dx, this._scroll.y + dy);
  }

  private _chaseTo(target: () => ScrollTarget): void {
    this._target = target;
    if (this._chasing) return;
    this._chasing = true;
    this.displayHost.scene!.events.on("prerender", this._stepChase, this);
  }

  private _stopChase(): void {
    if (!this._chasing) return;
    this._chasing = false;
    this.displayHost.scene!.events.off("prerender", this._stepChase, this);
  }

  private _stepChase(_renderer: unknown): void {
    const delta = this.displayHost.scene!.game.loop.delta;
    const k = 1 - Math.exp(-delta / SCROLL_TAU);
    // Clamp the target to the valid range so an out-of-range request still settles.
    const r = this._target();
    const m = this._maxScroll();
    const tx = PMath.Clamp(r.x, 0, m.x);
    const ty = PMath.Clamp(r.y, 0, m.y);
    this._setScroll(
      this._scroll.x + (tx - this._scroll.x) * k,
      this._scroll.y + (ty - this._scroll.y) * k,
    );
    if (Math.abs(tx - this._scroll.x) < 0.5 && Math.abs(ty - this._scroll.y) < 0.5) {
      this._setScroll(tx, ty);
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
  private _target = () => ({ x: 0, y: 0 });
  private _chasing = false;
}

type ScrollTarget = { x: number; y: number };

const SCROLL_TAU = 60;
