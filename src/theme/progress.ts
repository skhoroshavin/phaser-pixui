import {StyleList} from "./theme.ts";

export type ProgressStyle = {
    frame?: string,
    bar?: string,
    color?: string,
    paddingX?: number,
    paddingY?: number,
}

export function initProgressStyle(base: StyleList<ProgressStyle>) {
    if (base.frame == undefined) {
        console.error(`Base progress doesn't have frame defined`)
    }
    if (base.bar == undefined) {
        console.error(`Base progress doesn't have bar defined`)
    }
    base.color ??= 'default'
    base.paddingX ??= 0
    base.paddingY ??= 0

    if (!base.styles) return
    for (const style of Object.values(base.styles)) {
        style.frame ??= base.frame
        style.bar ??= base.bar
        style.color ??= base.color
        style.paddingX ??= base.paddingX
        style.paddingY ??= base.paddingY
    }
}
