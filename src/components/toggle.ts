import { Clickable } from "../behaviours/clickable";
import { Hoverable } from "../behaviours/hoverable";
import type { Mount } from "../mounts/mount";
import type { ImageConfig } from "./image";
import { Interactive, type InteractiveConfig } from "./interactive";
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

export type ToggleConfig = InteractiveConfig &
  ToggleStates & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
  };

export class Toggle extends Interactive {
  constructor(parent: Mount, cfg: ToggleConfig) {
    super(parent, { justifyContent: "center", alignItems: "center", ...cfg });
    this._states = {
      normal: cfg.normal,
      selected: cfg.selected,
      hover: cfg.hover,
      disabled: cfg.disabled,
      hover_selected: cfg.hover_selected,
      disabled_selected: cfg.disabled_selected,
    };
    this._checked = cfg.checked ?? false;
    this._onChange = cfg.onChange;

    this.addBehaviour(
      new Clickable({
        onClick: () => {
          this._checked = !this._checked;
          this._update();
          this._onChange?.(this._checked);
        },
        onUpdate: () => this._update(),
      }),
    );
    this._hover = this.addBehaviour(new Hoverable({ onUpdate: () => this._update() }));

    const onLayoutPrev = this.node.onLayout;
    this.node.onLayout = (rect, depth) => {
      onLayoutPrev?.(rect, depth);
      this._update();
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
    this._update();
  }

  protected onEnabledChange(): void {
    this._update();
  }

  private _update(): void {
    applyViewState(this.children, this._viewState());
  }

  private _viewState(): ViewState {
    const state = !this.enabled ? "disabled" : this._hover.hovered ? "hover" : "normal";
    const base = this._checked ? this._states.selected : this._states.normal;
    const key = (this._checked ? `${state}_selected` : state) as keyof ToggleStates;
    return this._states[key] ?? base;
  }

  private _checked: boolean;
  private readonly _onChange?: (checked: boolean) => void;
  private readonly _states: ToggleStates;
  private readonly _hover: Hoverable;
}
