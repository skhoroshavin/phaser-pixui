import { findStyle } from "../theme/theme.ts";
import { InsertContext } from "./context.ts";
import { Frame, FrameConfig } from "./frame.ts";
import { StyledComponent } from "./styled.ts";

export type DialogConfig = FrameConfig;

export class Dialog extends StyledComponent {
  constructor(ctx: InsertContext, cfg: DialogConfig) {
    super(ctx, { ...cfg, visible: false, width: 0, height: 0 });
    const style = findStyle("Dialog", cfg.style, ctx.theme.dialog);

    super.insert.interactive({});
    super.insert.rectangle({
      fillColor: style.backdropColor,
      fillAlpha: style.backdropAlpha,
    });
    this._frame = super.insert.frame({
      ...cfg,
      styleObject: style,
    });
  }

  get insert() {
    return this._frame.insert;
  }

  get visible() {
    return super.visible;
  }
  set visible(value: boolean) {
    super.visible = value;
    if (value) {
      this.bringToTop();
    }
  }

  private readonly _frame: Frame;
}
