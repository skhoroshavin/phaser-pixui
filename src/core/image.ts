import { Scene } from "phaser";
import { Renderable, RenderableConfig } from "./renderable.ts";

export type ImageConfig = {
    texture: string,
    frame: string,
} & RenderableConfig;

export class Image extends Renderable<Phaser.GameObjects.Sprite | Phaser.GameObjects.NineSlice> {
    constructor(scene: Scene, cfg: ImageConfig) {
        const frame = scene.textures.getFrame(cfg.texture, cfg.frame)
        const isScalable = frame.scale9 || frame.is3Slice
        const renderable = isScalable ?
            Image._createNineSlice(scene, cfg) :
            Image._createSprite(scene,cfg)

        super(scene, cfg, renderable)
        // @ts-ignore
        this.scalableX = isScalable && frame.customData.scale9Borders.w < frame.width
        // @ts-ignore
        this.scalableY = isScalable && frame.customData.scale9Borders.h < frame.height
    }
    readonly scalableX: boolean
    readonly scalableY: boolean

    get width() { return this.scalableX ? super.width : this.internal.width }
    get height() { return this.scalableY ? super.height : this.internal.height }

    protected afterReposition() {
        super.afterReposition();
        if (this.scalableX) this.internal.width = this.width
        if (this.scalableY) this.internal.height = this.height
    }

    private static _createSprite(scene: Scene, cfg: ImageConfig) {
        return scene.make.sprite({
            key: cfg.texture,
            frame: cfg.frame,
            visible: cfg.visible ?? true,
        })
    }

    private static _createNineSlice(scene: Scene, cfg: ImageConfig) {
        return scene.make.nineslice({
            key: cfg.texture,
            frame: cfg.frame,
            visible: cfg.visible ?? true,
        })
    }
}