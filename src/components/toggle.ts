import { Clickable, type ClickableConfig } from "./clickable";
import type { Component } from "./component";
import type { ImageConfig } from "./image";
import { MultiImage } from "./multi-image";
import { applyViewState, type ViewState } from "./view-state";

export type ToggleStates = {
  normal: ViewState;
  selected: ViewState;
  hover?: ViewState;
  disabled?: ViewState;
  hover_selected?: ViewState;
  disabled_selected?: ViewState;
};

export type ToggleConfig = Omit<ClickableConfig, "onUpdate"> & ToggleStates & {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export class Toggle extends Clickable {
  constructor(parent: Component, cfg: ToggleConfig) {
    const { normal, selected, hover, disabled, hover_selected, disabled_selected, checked, onChange, ...rest } = cfg;
    super(parent, {
      ...rest,
      onUpdate: () => applyViewState(this.children, this._viewState()),
      onClick: () => {
        if (!this.enabled) return;
        this._checked = !this._checked;
        applyViewState(this.children, this._viewState());
        this._onChange?.(this._checked);
      },
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "center",
    });
    this._states = { normal, selected, hover, disabled, hover_selected, disabled_selected };
    this._checked = checked ?? false;
    this._onChange = onChange;

    const onLayoutPrev = this.node.onLayout;
    this.node.onLayout = (rect, depth) => {
      onLayoutPrev?.(rect, depth);
      applyViewState(this.children, this._viewState());
    };
  }

  public addImage(cfg: Omit<ImageConfig, "frame">): MultiImage {
    const frames = Object.values(this._states)
      .filter((v): v is ViewState => v !== undefined)
      .map((v) => v.frame);
    return this.add(MultiImage, {
      ...cfg,
      frame: this._viewState().frame,
      frames,
    });
  }

  get checked(): boolean {
    return this._checked;
  }
  set checked(v: boolean) {
    if (this._checked === v) return;
    this._checked = v;
    applyViewState(this.children, this._viewState());
  }

  get enabled(): boolean {
    return super.enabled;
  }
  set enabled(v: boolean) {
    super.enabled = v;
    applyViewState(this.children, this._viewState());
  }

  private _viewState(): ViewState {
    const base = this._checked ? this._states.selected : this._states.normal;
    const key = (this._checked ? `${this.state}_selected` : this.state) as keyof ToggleStates;
    return this._states[key] ?? base;
  }

  private _checked: boolean;
  private readonly _onChange?: (checked: boolean) => void;
  private readonly _states: ToggleStates;
}
