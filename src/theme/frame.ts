import type { StyleList } from './theme.ts'

export type FrameStyle = {
    frame?: string
    paddingX?: number
    paddingY?: number
    tileX?: boolean
    tileY?: boolean
}

export function initFrameStyle(name: string, base: StyleList<FrameStyle>) {
    if (base.frame === undefined) {
        console.error(`Base ${name} doesn't have frame defined`)
    }
    base.paddingX ??= 0
    base.paddingY ??= 0
    base.tileX ??= false
    base.tileY ??= false

    if (!base.styles) return
    for (const style of Object.values(base.styles)) {
        style.frame ??= base.frame
        style.paddingX ??= base.paddingX
        style.paddingY ??= base.paddingY
        style.tileX ??= base.tileX
        style.tileY ??= base.tileY
    }
}
