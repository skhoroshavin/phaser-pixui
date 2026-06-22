import { Image } from "../core/image.ts";
import { findStyle } from "../theme/theme.ts";
import { OriginX } from "../util/origin.ts";
import type { InsertContext } from "./context.ts";
import { StyledComponent, StyledComponentConfig } from "./styled.ts";

export type ProgressConfig = StyledComponentConfig;

export class Progress extends StyledComponent {
  constructor(ctx: InsertContext, cfg: ProgressConfig) {
    super(ctx, cfg);
    const style = findStyle("Progress", cfg.style, ctx.theme.progress);

    this._bar = this.insert.left.image({
      texture: ctx.theme.resources.atlas,
      frame: style.bar!,
      x: style.paddingX!,
      width: -2 * style.paddingX!,
      height: -2 * style.paddingY!,
      originX: OriginX.Left,
    });
    this.insert.image({
      texture: ctx.theme.resources.atlas,
      frame: style.frame!,
    });
    this._paddingX = style.paddingX!;
  }

  get value() {
    return this._value;
  }
  set value(value: number) {
    this._value = value;
    this._updateBar();
  }
  private _value = 0;

  private _updateBar() {
    this._bar.visible = this._value > 0;
    this._bar.setWidth(this._value * (this.width - 2 * this._paddingX));
  }

  private _bar: Image;
  private readonly _paddingX;
}
