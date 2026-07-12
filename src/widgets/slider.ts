import { Draggable } from "../behaviours/draggable";
import { Hoverable } from "../behaviours/hoverable";
import { Component } from "../primitives/component";
import { Interactive, type InteractiveConfig } from "../primitives/interactive";
import { StatefulImage } from "../stateful/image";
import { StatefulComponentList } from "../stateful/base";

type SliderState = "normal" | "hover" | "pressed" | "disabled";

export type SliderConfig = InteractiveConfig & {
  texture: string;
  trackFrame: string;
  trackHoverFrame?: string;
  trackDisabledFrame?: string;
  thumbFrame: string;
  thumbHoverFrame?: string;
  thumbPressedFrame?: string;
  thumbDisabledFrame?: string;
  value?: number;
  onChange?: (value: number) => void;
};

export class Slider extends Interactive {
  constructor(parent: Component, cfg: SliderConfig) {
    super(parent, {
      ...cfg,
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "start",
    });

    this._value = cfg.value ?? 0;
    this._onChange = cfg.onChange;

    this._drag = this.addBehaviour(
      new Draggable({
        axis: "x",
        onDragStart: (x) => {
          this._update();
          this._dragThumb(x);
        },
        onDrag: (x) => this._dragThumb(x),
        onDragEnd: () => this._update(),
      }),
    );
    this._hover = this.addBehaviour(new Hoverable({ onUpdate: () => this._update() }));

    const trackHover = cfg.trackHoverFrame ? { frame: cfg.trackHoverFrame } : undefined;
    this._track = this.add(StatefulImage, {
      texture: cfg.texture,
      frame: cfg.trackFrame,
      inset: 0,
      marginY: "auto",
      states: {
        hover: trackHover,
        pressed: trackHover,
        disabled: cfg.trackDisabledFrame ? { frame: cfg.trackDisabledFrame } : undefined,
      },
    });
    this._statefulChildren.add(this._track);
    this.node.setIntrinsicSize(this._track.node.intrinsicSize());

    const thumbHover = cfg.thumbHoverFrame ? { frame: cfg.thumbHoverFrame } : undefined;
    const thumbPressed = cfg.thumbPressedFrame ? { frame: cfg.thumbPressedFrame } : thumbHover;
    this._thumb = this.add(StatefulImage, {
      texture: cfg.texture,
      frame: cfg.thumbFrame,
      states: {
        hover: thumbHover,
        pressed: thumbPressed,
        disabled: cfg.thumbDisabledFrame ? { frame: cfg.thumbDisabledFrame } : undefined,
      },
    });
    this._statefulChildren.add(this._thumb);

    const thumbOrigLayout = this._thumb.node.onLayout;
    this._thumb.node.onLayout = (rect, depth) => {
      thumbOrigLayout?.(rect, depth);
      const tw = this._thumb.node.rect.width;
      const cw = this.node.xAxis.contentSize(this.node.rect.width);
      this._thumbHalf = tw / 2;
      this._thumbTravel = Math.max(0, cw - tw);
      this._positionThumb();
    };

    this._update();
  }

  get value(): number {
    return this._value;
  }
  set value(v: number) {
    v = Math.max(0, Math.min(1, v));
    if (this._value === v) return;
    this._value = v;
    this._positionThumb();
  }

  protected onEnabledChange(): void {
    this._update();
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (v) this._update();
  }

  private _dragThumb(localX: number): void {
    const cx = Math.round(localX) - this.node.xAxis.paddingStart;
    const prev = this._value;
    this.value = (cx - this._thumbHalf) / Math.max(1, this._thumbTravel);
    if (this._value !== prev) this._onChange?.(this._value);
  }

  private _state(): SliderState {
    if (!this.enabled) return "disabled";
    if (this._drag.dragging) return "pressed";
    if (this._hover.hovered) return "hover";
    return "normal";
  }

  private _update(): void {
    this._statefulChildren.setState(this._state());
    this._positionThumb();
  }

  /** Position the thumb from its value (re-applied after state resets offsets). */
  private _positionThumb(): void {
    this._thumb.setOffsetX(Math.floor(this._value * this._thumbTravel));
  }

  private _value: number;
  private readonly _onChange?: (value: number) => void;
  private readonly _track: StatefulImage;
  private readonly _thumb: StatefulImage;
  private readonly _drag: Draggable;
  private readonly _hover: Hoverable;
  private readonly _statefulChildren = new StatefulComponentList();
  private _thumbHalf = 0;
  private _thumbTravel = 0;
}
