import type { GameObjects } from 'phaser'
import { Scene } from 'phaser'
import { Component, ComponentConfig } from './component.ts'

export type RectangleConfig = ComponentConfig & {
    fillColor?: number
    fillAlpha?: number
}

export class Rectangle extends Component {
    constructor(scene: Scene, cfg?: RectangleConfig) {
        super(scene, cfg)

        this._fillColor = cfg?.fillColor
        this._fillAlpha = cfg?.fillAlpha ?? 1
        this._internal = scene.add.rectangle()
        this._updateFill()
    }

    protected override updateVisible(visible: boolean) {
        this._internal.visible = visible
    }

    get fillColor(): number | undefined {
        return this._fillColor
    }
    set fillColor(value: number | undefined) {
        this._fillColor = value
        this._updateFill()
    }
    private _fillColor?: number

    get fillAlpha(): number {
        return this._fillAlpha
    }
    set fillAlpha(value: number) {
        this._fillAlpha = value
        this._updateFill()
    }
    private _fillAlpha: number

    override bringToTop() {
        this.scene.children.bringToTop(this._internal)
    }

    protected override updatePosition() {
        this._internal.setOrigin(this.originX, this.originY)
        this._internal.setPosition(this.x, this.y)
        this._internal.setSize(this.width, this.height)
    }

    private _updateFill() {
        if (this._fillColor !== undefined && this._fillAlpha > 0) {
            this._internal.setFillStyle(this._fillColor, this._fillAlpha)
        } else {
            this._internal.setFillStyle()
        }
    }

    private readonly _internal: GameObjects.Rectangle
}
