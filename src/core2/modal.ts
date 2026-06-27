import { Component, type ComponentConfig } from "./component";
import { Rectangle } from "./rectangle";
import { Clickable } from "./clickable";

export type ModalConfig = ComponentConfig & {
  backdropColor?: number;
  backdropAlpha?: number;
  dismissOnBackdropClick?: boolean;
  onDismiss?: () => void;
};

export class Modal extends Component {
  constructor(parent: Component, cfg?: ModalConfig) {
    super(parent, { ...cfg, visible: cfg?.visible ?? false });

    this._onDismiss = cfg?.onDismiss;
    this._dismissOnBackdropClick = cfg?.dismissOnBackdropClick ?? false;

    new Rectangle(this, {
      inset: 0,
      fillColor: cfg?.backdropColor ?? 0x000000,
      fillAlpha: cfg?.backdropAlpha ?? 0.5,
    });

    new Clickable(this, {
      inset: 0,
      zIndex: 1,
      onClick: () => this._onBackdropClick(),
    });
  }

  private _onBackdropClick(): void {
    if (this._dismissOnBackdropClick) this._dismiss();
  }

  private _dismiss(): void {
    this.visible = false;
    this._onDismiss?.();
  }

  private _onDismiss?: () => void;
  private _dismissOnBackdropClick: boolean;
}
