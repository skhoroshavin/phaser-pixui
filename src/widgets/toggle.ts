import { Clickable } from "../behaviours/clickable";
import { Hoverable } from "../behaviours/hoverable";
import { Component } from "../primitives/component";
import { type ImageConfig } from "../primitives/image";
import { Interactive, type InteractiveConfig } from "../primitives/interactive";
import { type TextConfig } from "../primitives/text";
import { type ImageStateConfig, StatefulImage } from "../stateful/image";
import { StatefulText, type TextStateConfig } from "../stateful/text";
import { StatefulComponentList } from "../stateful/base";

/** {@link Toggle} configuration. */
export type ToggleConfig = InteractiveConfig & {
  /** Initial checked state. Defaults to `false`. */
  checked?: boolean;
  /** Called when the checked state changes. */
  onChange?: (checked: boolean) => void;
};

/**
 * A headless toggle control. Renders nothing by itself, instead tracks checked, hover,
 * and disabled states, and applies them to child stateful components, added via
 * {@link Toggle.addImage} and {@link Toggle.addText}.
 */
export class Toggle extends Interactive {
  constructor(parent: Component, cfg: ToggleConfig) {
    super(parent, { justifyContent: "center", alignItems: "center", ...cfg });
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

  /** Adds an image that changes appearance based on the toggle state. */
  public addImage(cfg: ImageConfig & ToggleStates<ImageStateConfig>): StatefulImage {
    const img = this.add(StatefulImage, {
      ...cfg,
      states: {
        selected: cfg.selected,
        hover: cfg.hover,
        disabled: cfg.disabled,
        hover_selected: cfg.hover_selected,
        disabled_selected: cfg.disabled_selected,
      },
    });
    this._statefulChildren.add(img);
    return img;
  }

  /** Adds a text that changes appearance based on the toggle state. */
  public addText(cfg: TextConfig & ToggleStates<TextStateConfig>): StatefulText {
    const txt = this.add(StatefulText, {
      ...cfg,
      states: {
        selected: cfg.selected,
        hover: cfg.hover,
        disabled: cfg.disabled,
        hover_selected: cfg.hover_selected,
        disabled_selected: cfg.disabled_selected,
      },
    });
    this._statefulChildren.add(txt);
    return txt;
  }

  /** Current checked state. */
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

  private _state(): keyof ToggleStates<never> | undefined {
    if (!this.enabled) return this._checked ? "disabled_selected" : "disabled";
    if (this._hover.hovered) return this._checked ? "hover_selected" : "hover";
    return this._checked ? "selected" : undefined;
  }

  private _update(): void {
    this._statefulChildren.setState(this._state(), this._checked ? "selected" : undefined);
  }

  private _checked: boolean;
  private readonly _onChange?: (checked: boolean) => void;
  private readonly _hover: Hoverable;
  private readonly _statefulChildren = new StatefulComponentList();
}

type ToggleStates<StateConfig> = {
  selected?: StateConfig;
  hover?: StateConfig;
  disabled?: StateConfig;
  hover_selected?: StateConfig;
  disabled_selected?: StateConfig;
};
