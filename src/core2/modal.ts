import type { Component, ComponentConfig } from "./component";
import { Clickable } from "./clickable";
import { Rectangle } from "./rectangle";
import { Interactive } from "./interactive";

export type ModalConfig = ComponentConfig & {
  backdropColor?: number;
  backdropAlpha?: number;
  dismissOnBackdropClick?: boolean;
  onDismiss?: () => void;
};

export class Modal extends Clickable {
  constructor(parent: Component, cfg?: ModalConfig) {
    super(parent, {
      inset: 0,
      zIndex: 100,
      ...cfg,
      onClick: () => this._onBackdropClick(),
      visible: cfg?.visible ?? false,
    });

    this._onDismiss = cfg?.onDismiss;
    this._dismissOnBackdropClick = cfg?.dismissOnBackdropClick ?? false;

    new Rectangle(this, {
      inset: 0,
      fillColor: cfg?.backdropColor ?? 0x000000,
      fillAlpha: cfg?.backdropAlpha ?? 0.5,
    });

    this.content = new Interactive(this, { margin: "auto" });
  }

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
