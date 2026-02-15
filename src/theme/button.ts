import {FontStyle, initFontStyle} from "./font.ts";
import {StyleList, ThemeConfig} from "./theme.ts";
import {Shape} from "../core/interactive.ts";

type Texture = Phaser.Textures.Texture;

export type ButtonStyle = {
    frame?: string,
    frameUp?: string,
    frameDown?: string,
    frameHover?: string,
    frameDisabled?: string,
    defaultWidth?: number,
    defaultHeight?: number,
    shape?: Shape,
    fontTintDisabled?: string,
} & FontStyle

export function initButtonStyle(base: StyleList<ButtonStyle>, theme: ThemeConfig, atlas: Texture) {
    initAtlasFrames(base, atlas)
    if (base.frameUp === undefined) console.error(`Base button doesn't have frameUp defined`)
    if (base.frameDown === undefined) console.error(`Base button doesn't have frameDown defined`)
    base.frameHover ??= base.frameUp
    base.frameDisabled ??= base.frameUp
    base.shape ??= 'rect'
    initFontStyle(base, theme)
    base.fontTintDisabled ??= base.fontTint

    if (!base.styles) return
    for (const style of Object.values(base.styles)) {
        style.frame ??= base.frame
        initAtlasFrames(style, atlas)

        style.frameUp ??= base.frameUp
        style.frameDown ??= base.frameDown
        style.frameHover ??= base.frameHover
        style.frameDisabled ??= base.frameDisabled
        style.shape ??= base.shape
        style.defaultWidth ??= base.defaultWidth
        style.defaultHeight ??= base.defaultHeight
        style.fontTintDisabled ??= base.fontTintDisabled
        initFontStyle(style, base)
    }
}

function initAtlasFrames(style: ButtonStyle, atlas: Texture) {
    if (!style.frame) return

    const frame = (name: string) => atlas.has(name) ? name : undefined
    style.frameUp ??= frame(`${style.frame}_up`)
    style.frameDown ??= frame(`${style.frame}_down`)
    style.frameHover ??= frame(`${style.frame}_hover`)
    style.frameDisabled ??= frame(`${style.frame}_disabled`)

    const frameObj = atlas.get(style.frameUp)
    const customData = frameObj.customData as { scale9Borders?: {w: number, h: number} } | undefined
    const scale9 = customData?.scale9Borders
    if (!scale9 || scale9.w == frameObj.width) style.defaultWidth ??= frameObj.width
    if (!scale9 || scale9.h == frameObj.height) style.defaultHeight ??= frameObj.height
}
