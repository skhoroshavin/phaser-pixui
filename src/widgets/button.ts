import { Clickable } from "../behaviours/clickable";
import { Hoverable } from "../behaviours/hoverable";
import { Component } from "../primitives/component";
import { Interactive, type InteractiveConfig } from "../primitives/interactive";
import type { ImageConfig } from "../primitives/image";
import { MultiImage } from "../primitives/multi-image";
import { applyViewState, type ViewState } from "../primitives/view-state";

export type ButtonConfig = InteractiveConfig & {
  onClick?: () => void;
  normal: ViewState;
  hover?: ViewState;
  pressed?: ViewState;
  disabled?: ViewState;
};

export class Button extends Interactive {
  constructor(parent: Component, cfg: ButtonConfig) {
    super(parent, { justifyContent: "center", alignItems: "center", ...cfg });
    this._states = {
      normal: cfg.normal,
      hover: cfg.hover,
      pressed: cfg.pressed,
      disabled: cfg.disabled,
    };

    this._click = this.addBehaviour(
      new Clickable({ onClick: cfg.onClick, onUpdate: () => this._update() }),
    );
    this._hover = this.addBehaviour(new Hoverable({ onUpdate: () => this._update() }));

    const onLayoutPrev = this.node.onLayout;
    this.node.onLayout = (rect, depth) => {
      onLayoutPrev?.(rect, depth);
      this._update();
    };
  }

  public addImage(cfg: Omit<ImageConfig, "frame">): MultiImage {
    const frames = [this._states.normal.frame];
    if (this._states.hover) frames.push(this._states.hover.frame);
    if (this._states.pressed) frames.push(this._states.pressed.frame);
    if (this._states.disabled) frames.push(this._states.disabled.frame);
    return this.add(MultiImage, {
      ...cfg,
      frame: this._states.normal.frame,
      frames,
    });
  }

  protected onEnabledChange(): void {
    this._update();
  }

  private _update(): void {
    applyViewState(this._children, this._viewState());
  }

  private _viewState(): ViewState {
    if (!this.enabled) return this._states.disabled ?? this._states.normal;
    if (this._click.pressed) return this._states.pressed ?? this._states.normal;
    if (this._hover.hovered) return this._states.hover ?? this._states.normal;
    return this._states.normal;
  }

  private readonly _click: Clickable;
  private readonly _hover: Hoverable;
  private readonly _states: {
    normal: ViewState;
    hover?: ViewState;
    pressed?: ViewState;
    disabled?: ViewState;
  };
}
