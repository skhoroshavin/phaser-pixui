import { Draggable } from "../behaviours/draggable";
import { Hoverable } from "../behaviours/hoverable";
import { Component } from "../primitives/component";
import { type ImageConfig } from "../primitives/image";
import { Interactive, type InteractiveConfig } from "../primitives/interactive";
import { type Axis } from "../shared/axis";
import { StatefulComponentList } from "../stateful/base";
import { type ImageStateConfig, type ImageValueConfig, StatefulImage } from "../stateful/image";

type SliderState = "normal" | "hover" | "pressed" | "disabled";

export type SliderConfig = InteractiveConfig & {
  axis?: Axis;
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

    this._axis = cfg.axis ?? "x";
    this._value = cfg.value ?? 0;
    this._onChange = cfg.onChange;

    this._drag = this.addBehaviour(
      new Draggable({
        axis: this._axis,
        onDragStart: (x, y) => {
          this._update();
          this._dragTo(this._axis === "x" ? x : y);
        },
        onDrag: (x, y) => this._dragTo(this._axis === "x" ? x : y),
        onDragEnd: () => this._update(),
      }),
    );
    this._hover = this.addBehaviour(new Hoverable({ onUpdate: () => this._update() }));
  }

  public addImage(
    cfg: ImageConfig & SliderStates<ImageStateConfig> & { valueBinding?: ImageValueConfig },
  ): StatefulImage {
    const img = this.add(StatefulImage, {
      ...cfg,
      valueBinding: cfg.valueBinding,
      states: {
        normal: cfg.normal,
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
    });
    this._statefulChildren.add(img);
    if (cfg.valueBinding?.mode === "position" && this._thumb === undefined) this._thumb = img;
    img.setState(this._state());
    img.setValue(this._value);
    return img;
  }

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
    this._update();
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (v) this._update();
  }

  private _dragTo(local: number): void {
    const prev = this._value;
    const thumb = this._thumb;
    if (thumb !== undefined) {
      const padding =
        this._axis === "x" ? this.node.xAxis.paddingStart : this.node.yAxis.paddingStart;
      const half = (this._axis === "x" ? thumb.node.rect.width : thumb.node.rect.height) / 2;
      const t = Math.max(1, thumb.travel);
      let v = (local - padding - half) / t;
      if (this._axis === "y") v = 1 - v;
      this.value = v;
    }
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
  }

  private readonly _axis: Axis;
  private _value: number;
  private readonly _onChange?: (value: number) => void;
  private readonly _drag: Draggable;
  private readonly _hover: Hoverable;
  private readonly _statefulChildren = new StatefulComponentList();
  private _thumb?: StatefulImage;
}

type SliderStates<StateConfig> = {
  normal?: StateConfig;
  hover?: StateConfig;
  pressed?: StateConfig;
  disabled?: StateConfig;
};
