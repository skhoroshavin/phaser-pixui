import { Clickable } from "../behaviours/clickable";
import type { ComponentConfig } from "../primitives/component";
import { Component } from "../primitives/component";
import { Interactive } from "../primitives/interactive";
import { Rectangle } from "../primitives/rectangle";

/** {@link Modal} configuration. */
export type ModalConfig = ComponentConfig & {
  /** Backdrop fill color. Defaults to `0x000000` (black). */
  backdropColor?: number;
  /** Backdrop fill alpha. Defaults to `0.5`. */
  backdropAlpha?: number;
  /** Whether clicking the backdrop dismisses the modal. Defaults to `false`. */
  dismissOnBackdropClick?: boolean;
  /** Called when the modal is dismissed. */
  onDismiss?: () => void;
};

/**
 * A modal dialog. Occupies the whole screen (over everything else), renders a dimmed
 * backdrop, and centers its {@link Modal.content} container. Initially hidden,
 * show it by setting `visible` to `true`.
 */
export class Modal extends Interactive {
  constructor(parent: Component, cfg: ModalConfig = {}) {
    super(parent, {
      inset: 0,
      zIndex: 100,
      ...cfg,
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
      visible: cfg.visible ?? false,
    });

    this._onDismiss = cfg.onDismiss;
    this._dismissOnBackdropClick = cfg.dismissOnBackdropClick ?? false;

    this.addBehaviour(new Clickable({ onClick: () => this._onBackdropClick() }));

    new Rectangle(this, {
      inset: 0,
      fillColor: cfg.backdropColor ?? 0x000000,
      fillAlpha: cfg.backdropAlpha ?? 0.5,
    });

    this.content = new Interactive(this, {});
  }

  /** Container for dialog content, centered inside the modal. */
  readonly content: Interactive;

  private _onBackdropClick(): void {
    if (this._dismissOnBackdropClick) this._dismiss();
  }

  private _dismiss(): void {
    this.visible = false;
    this._onDismiss?.();
  }

  private readonly _onDismiss?: () => void;
  private readonly _dismissOnBackdropClick: boolean;
}
