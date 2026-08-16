import { Draggable } from "../behaviours/draggable";
import { Hoverable } from "../behaviours/hoverable";
import { Component } from "../primitives/component";
import { type ImageConfig } from "../primitives/image";
import { Interactive, type InteractiveConfig } from "../primitives/interactive";
import { type Axis } from "../shared/axis";
import { StatefulComponentList } from "../stateful/base";
import { type ImageStateConfig, type ImageValueConfig, StatefulImage } from "../stateful/image";

/** {@link Slider} configuration. */
export type SliderConfig = InteractiveConfig & {
  /** Slider axis. Defaults to `"x"`. */
  axis?: Axis;
  /** Initial value, between `0` and `1`. Defaults to `0`. */
  value?: number;
  /** Called when the value changes as a result of dragging. */
  onChange?: (value: number) => void;
};

/**
 * A headless slider control. Renders nothing by itself; track and thumb
 * visuals are provided via {@link Slider.addImage} and {@link Slider.addThumb}.
 * The value is a number between `0` and `1`.
 */
export class Slider extends Interactive {
  constructor(parent: Component, cfg: SliderConfig) {
    super(parent, {
      ...cfg,
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "start",
    });

    this._horizontal = cfg.axis != "y";
    this._value = cfg.value ?? 0;
    this._onChange = cfg.onChange;

    this._drag = this.addBehaviour(
      new Draggable({
        axis: this._horizontal ? "x" : "y",
        onDragStart: (x, y) => {
          this._statefulChildren.setState(this._state());
          this._dragTo(this._horizontal ? x : y);
        },
        onDrag: (x, y) => this._dragTo(this._horizontal ? x : y),
        onDragEnd: () => this._statefulChildren.setState(this._state()),
      }),
    );
    this._hover = this.addBehaviour(
      new Hoverable({ onUpdate: () => this._statefulChildren.setState(this._state()) }),
    );
  }

  /** Adds a track "fill" image, which can be scaled based on the slider value */
  public addImage(
    cfg: ImageConfig & SliderStates<ImageStateConfig> & { valueBinding?: ImageValueConfig },
  ): StatefulImage {
    const img = this.add(StatefulImage, {
      ...cfg,
      states: {
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
    });
    this._statefulChildren.add(img);
    img.setState(this._state());
    img.setValue(this._value);
    return img;
  }

  /** Adds a draggable thumb image, positioned based on the slider value. */
  public addThumb(cfg: ImageConfig & SliderStates<ImageStateConfig>): StatefulImage {
    const img = this.add(StatefulImage, {
      ...cfg,
      valueBinding: { mode: "position", axis: this._horizontal ? "x" : "y" },
      states: {
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
    });
    this._statefulChildren.add(img);
    this._thumb = img;
    img.setState(this._state());
    img.setValue(this._value);
    return img;
  }

  /** Current value, clamped to the range `0..1`. */
  get value(): number {
    return this._value;
  }
  set value(v: number) {
    v = Math.max(0, Math.min(1, v));
    if (this._value === v) return;
    this._value = v;
    this._statefulChildren.setValue(v);
  }

  protected onEnabledChange(): void {
    this._statefulChildren.setState(this._state());
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (v) this._statefulChildren.setState(this._state());
  }

  private _dragTo(local: number): void {
    const thumb = this._thumb?.node;
    if (thumb === undefined) return;

    const currentPos = local + (this._horizontal ? this.node.rect.x : this.node.rect.y);
    const availableStart = this._horizontal ? thumb.availableRect.x : thumb.availableRect.y;

    const thumbSize = this._horizontal ? thumb.rect.width : thumb.rect.height;
    const availableSize = this._horizontal ? thumb.availableRect.width : thumb.availableRect.height;
    const travel = Math.max(1, availableSize - thumbSize);

    let v = (currentPos - thumbSize / 2 - availableStart) / travel;
    if (!this._horizontal) v = 1 - v;
    v = Math.max(0, Math.min(1, v));
    if (v == this.value) return;

    this.value = v;
    this._onChange?.(v);
  }

  private _state(): keyof SliderStates<never> | undefined {
    if (!this.enabled) return "disabled";
    if (this._drag.dragging) return "pressed";
    if (this._hover.hovered) return "hover";
    return;
  }

  private readonly _horizontal: boolean;
  private _value: number;
  private readonly _onChange?: (value: number) => void;
  private readonly _drag: Draggable;
  private readonly _hover: Hoverable;
  private readonly _statefulChildren = new StatefulComponentList();
  private _thumb?: StatefulImage;
}

type SliderStates<StateConfig> = {
  hover?: StateConfig;
  pressed?: StateConfig;
  disabled?: StateConfig;
};
