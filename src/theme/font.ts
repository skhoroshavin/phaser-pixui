
export type FontStyle = {
    fontName?: string,
    fontSize?: number,
    fontTint?: string,
}

export function initBaseFontStyle(style: FontStyle) {
    if (style.fontName == undefined) {
        console.error(`Base font doesn't have fontName defined`)
    }
}

export function initFontStyle(style: FontStyle, fallback: FontStyle) {
    style.fontName ??= fallback.fontName
    style.fontSize ??= fallback.fontSize
    style.fontTint ??= fallback.fontTint
}
