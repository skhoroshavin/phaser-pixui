import {Scene} from "phaser";
import {Renderable, RenderableConfig} from "./renderable.ts";
import {OriginX, OriginY} from "../util/origin.ts";
import {TextAlign} from "../util/align.ts";

export type BitmapTextConfig = {
    font: string,
    size?: number,
    align?: TextAlign,
    text?: string,
} & RenderableConfig;

export class BitmapText extends Renderable<Phaser.GameObjects.BitmapText> {
    constructor(scene: Scene, cfg: BitmapTextConfig) {
        super(scene, cfg, scene.make.bitmapText({
            font: cfg.font,
            size: cfg.size,
            text: cfg.text,
            visible: cfg.visible ?? true,
        }));

        if (cfg.align) this.align = cfg.align;
    }

    get text() { return this.internal.text }
    set text(value: string) { this.internal.text = value; this.updatePosition() }

    get align(): TextAlign { return this.internal.align }
    set align(value: TextAlign) { this.internal.align = value }

    get width() { return this.internal.width }
    get height() { return this.internal.height }

    protected afterReposition() {
        super.afterReposition()

        let x: number
        switch (this.originX) {
            case OriginX.Center: x = this.x - Math.floor(this.width / 2); break;
            case OriginX.Left: x = this.left; break;
            case OriginX.Right: x = this.right - this.width; break;
        }

        let y: number
        switch (this.originY) {
            case OriginY.Center: y = this.y - Math.floor(this.height / 2); break;
            case OriginY.Top: y = this.top; break;
            case OriginY.Bottom: y = this.bottom - this.height; break;
        }

        this.internal.setPosition(x, y)
        this.internal.setMaxWidth(super.width)
    }
}
