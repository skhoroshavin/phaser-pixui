import type { GameObjects } from 'phaser'
import { Scene } from 'phaser'
import { frameDimensions } from '../util/frame.ts'
import { Renderable, RenderableConfig } from './renderable.ts'

export type ImageConfig = {
    texture: string
    frame: string
    tileX?: boolean
    tileY?: boolean
} & RenderableConfig

export class Image extends Renderable<GameObjects.Sprite | GameObjects.NineSlice> {
    constructor(scene: Scene, cfg: ImageConfig) {
        const frame = frameDimensions(scene.textures.getFrame(cfg.texture, cfg.frame))
        const fixedWidth = frame.scalableX ? undefined : frame.width
        const fixedHeight = frame.scalableY ? undefined : frame.height

        cfg = {
            ...cfg,
            width: cfg.width ?? fixedWidth,
            height: cfg.height ?? fixedHeight,
        }

        const renderable =
            frame.scalableX || frame.scalableY
                ? Image._createNineSlice(scene, cfg)
                : Image._createSprite(scene, cfg)
        super(scene, cfg, renderable)
        this.scalableX = frame.scalableX
        this.scalableY = frame.scalableY
    }
    readonly scalableX: boolean
    readonly scalableY: boolean

    protected override updatePosition() {
        super.updatePosition()
        if (this.scalableX) this.internal.width = this.width
        if (this.scalableY) this.internal.height = this.height
    }

    private static _createSprite(scene: Scene, cfg: ImageConfig) {
        return scene.make.sprite({
            key: cfg.texture,
            frame: cfg.frame,
            visible: false,
        })
    }

    private static _createNineSlice(scene: Scene, cfg: ImageConfig) {
        return scene.make.nineslice({
            key: cfg.texture,
            frame: cfg.frame,
            tileX: cfg.tileX,
            tileY: cfg.tileY,
            visible: false,
        })
    }
}
