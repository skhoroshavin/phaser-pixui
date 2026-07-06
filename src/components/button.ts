import { Clickable, type ClickableConfig, type ClickableState } from "./clickable";
import type { Component } from "./component";
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
      onUpdate: (s) => this._apply(s),
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "center",
    });
    this._view = { normal, hover, pressed, disabled };

    // Children are added after construction, so reapply on layout.
    const onLayoutPrev = this.node.onLayout;
    this.node.onLayout = (rect, depth) => {
      onLayoutPrev?.(rect, depth);
      this._apply(this.state);
    };
  }

  get enabled(): boolean {
    return super.enabled;
  }

  set enabled(v: boolean) {
    super.enabled = v;
    this._apply(this.state);
  }

  private _apply(s: ClickableState) {
    applyViewState(this.children, this._resolve(s));
  }

  private _resolve(s: ClickableState): ViewState {
    return this._view[s] ?? this._view.normal!;
  }

  private readonly _view: Record<ClickableState, ViewState | undefined>;
}
