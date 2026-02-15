
import {FontStyle, initFontStyle} from "./font.ts";
import {StyleList, ThemeConfig} from "./theme.ts";
import {TextAlign} from "../util/align.ts";

export type TextAreaStyle = {
    frame?: string,
    paddingX?: number,
    paddingY?: number,
    defaultAlign?: TextAlign,
} & FontStyle

export function initTextAreaStyle(base: StyleList<TextAreaStyle>, theme: ThemeConfig) {
    base.paddingX ??= 0
    base.paddingY ??= 0
    initFontStyle(base, theme)

    if (!base.styles) return
    for (const style of Object.values(base.styles)) {
        style.frame ??= base.frame
        style.paddingX ??= base.paddingX
        style.paddingY ??= base.paddingY
        initFontStyle(style, base)
    }
}
