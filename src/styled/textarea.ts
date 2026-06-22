import { BitmapText } from "../core/bitmaptext.ts";
import { findStyle, resolveColor } from "../theme/theme.ts";
import { TextAlign } from "../util/align.ts";
import type { InsertContext } from "./context.ts";
import { StyledComponent, StyledComponentConfig } from "./styled.ts";

export type TextAreaConfig = {
  text?: string;
  textAlign?: TextAlign;
} & StyledComponentConfig;

export class TextArea extends StyledComponent {
  constructor(ctx: InsertContext, cfg: TextAreaConfig) {
    super(ctx, cfg);
    const style = findStyle("TextArea", cfg.style, ctx.theme.textArea);

    const align = cfg.textAlign ?? style.defaultAlign ?? TextAlign.Left;
    const textFactory =
      align === TextAlign.Left
        ? this.insert.topLeft
        : align === TextAlign.Right
          ? this.insert.topRight
          : this.insert.center;

    this._text = textFactory.bitmapText({
      text: cfg.text,
      align: align,
      font: style.fontName!,
      size: style.fontSize,
      tint: resolveColor(style.fontTint, ctx.theme.palette),
      visible: this.visible,
    });
  }

  get text() {
    return this._text.text;
  }
  set text(value: string) {
    this._text.text = value;
  }

  protected readonly _text: BitmapText;
}
