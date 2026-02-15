import {findStyle, resolveColor, ThemeConfig} from "../theme/theme.ts";
import {Scene} from "phaser";
import {BitmapText} from "../core/bitmaptext.ts";
import {StyledComponent, StyledComponentConfig} from "./styled.ts";
import {TextAlign} from "../util/align.ts";

export type TextAreaConfig = {
    text?: string,
    textAlign?: TextAlign
} & StyledComponentConfig

export class TextArea extends StyledComponent {
    constructor(scene: Scene, theme: ThemeConfig, cfg: TextAreaConfig) {
        super(scene, theme, cfg);
        const style = findStyle('TextArea', cfg.style, theme.textArea)

        if (style.frame) {
            this.insert.image({
                texture: theme.resources.texture,
                frame: style.frame,
                visible: this.visible,
            })
        }

        const paddingX = style.paddingX!
        const paddingY = style.paddingY!

        const align = cfg.textAlign ?? style.defaultAlign ?? TextAlign.Left
        const textFactory =
            align == TextAlign.Left ? this.insert.topLeft :
            align == TextAlign.Right ? this.insert.topRight :
                this.insert.topLeft

        this._text = textFactory.bitmapText({
            text: cfg.text,
            align: cfg.textAlign ?? style.defaultAlign,
            x: paddingX,
            y: paddingY,
            font: style.fontName!,
            size: style.fontSize,
            tint: resolveColor(style.fontTint, theme.palette),
            visible: this.visible,
        })
    }

    get text() { return this._text.text; }
    set text(value: string) { this._text.text = value; }

    protected readonly _text: BitmapText;
}
