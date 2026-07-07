import { Clickable, type ClickableConfig } from "./clickable";
import type { Component } from "./component";
import type { ImageConfig } from "./image";
import { MultiImage } from "./multi-image";
import { applyViewState, type ViewState } from "./view-state";

export type ButtonConfig = Omit<ClickableConfig, "onUpdate"> & {
  normal: ViewState;
  hover?: ViewState;
  pressed?: ViewState;
  disabled?: ViewState;
};

export class Button extends Clickable {
  constructor(parent: Component, cfg: ButtonConfig) {
    const { normal, hover, pressed, disabled, ...rest } = cfg;
    super(parent, {
      ...rest,
      onUpdate: () => applyViewState(this.children, this._viewState()),
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "center",
    });
    this._states = { normal, hover, pressed, disabled };

    // Children are added after construction, so reapply on layout.
    const onLayoutPrev = this.node.onLayout;
    this.node.onLayout = (rect, depth) => {
      onLayoutPrev?.(rect, depth);
      applyViewState(this.children, this._viewState());
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

  get enabled(): boolean {
    return super.enabled;
  }

  set enabled(v: boolean) {
    super.enabled = v;
    applyViewState(this.children, this._viewState());
  }

  private _viewState(): ViewState {
    const s = this.state;
    return this._states[s] ?? this._states.normal;
  }

  private readonly _states: {
    normal: ViewState;
    hover?: ViewState;
    pressed?: ViewState;
    disabled?: ViewState;
  };
}
