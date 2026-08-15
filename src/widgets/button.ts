import { Clickable } from "../behaviours/clickable";
import { Hoverable } from "../behaviours/hoverable";
import { Component } from "../primitives/component";
import { type ImageConfig } from "../primitives/image";
import { Interactive, type InteractiveConfig } from "../primitives/interactive";
import { type TextConfig } from "../primitives/text";
import { type ImageStateConfig, StatefulImage } from "../stateful/image";
import { StatefulText, type TextStateConfig } from "../stateful/text";
import { StatefulComponentList } from "../stateful/base";

/** {@link Button} configuration. */
export type ButtonConfig = InteractiveConfig & {
  /** Called when the button is clicked. */
  onClick?: () => void;
};

/**
 * A headless button control. Renders nothing by itself, instead tracks hover and pressed
 * states, and applies them to child stateful components, added via {@link Button.addImage}
 * and {@link Button.addText}.
 */
export class Button extends Interactive {
  constructor(parent: Component, cfg: ButtonConfig) {
    super(parent, { justifyContent: "center", alignItems: "center", ...cfg });
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

  /** Adds an image that changes appearance based on the button state. */
  public addImage(cfg: ImageConfig & ButtonStates<ImageStateConfig>): StatefulImage {
    const img = this.add(StatefulImage, {
      ...cfg,
      states: {
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
    });
    this._statefulChildren.add(img);
    return img;
  }

  /** Adds a text that changes appearance based on the button state. */
  public addText(cfg: TextConfig & ButtonStates<TextStateConfig>): StatefulText {
    const txt = this.add(StatefulText, {
      ...cfg,
      states: {
        hover: cfg.hover,
        pressed: cfg.pressed,
        disabled: cfg.disabled,
      },
    });
    this._statefulChildren.add(txt);
    return txt;
  }

  protected onEnabledChange(): void {
    this._update();
  }

  private _state(): keyof ButtonStates<never> | undefined {
    if (!this.enabled) return "disabled";
    if (this._click.pressed) return "pressed";
    if (this._hover.hovered) return "hover";
    return;
  }

  private _update(): void {
    this._statefulChildren.setState(this._state());
  }

  private readonly _click: Clickable;
  private readonly _hover: Hoverable;
  private readonly _statefulChildren = new StatefulComponentList();
}

type ButtonStates<StateConfig> = {
  hover?: StateConfig;
  pressed?: StateConfig;
  disabled?: StateConfig;
};
