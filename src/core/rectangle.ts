import { Scene } from "phaser";
import { Component, ComponentConfig } from "./component.ts";

export type RectangleConfig = ComponentConfig & {
    fillColor?: number,
    fillAlpha?: number,
    borderColor?: number,
    borderAlpha?: number,
    borderWidth?: number,
};

export class Rectangle extends Component {
    constructor(scene: Scene, cfg?: RectangleConfig) {
        super(scene, cfg)

        this._fillColor = cfg?.fillColor
        this._fillAlpha = cfg?.fillAlpha ?? 1
        this._borderColor = cfg?.borderColor
        this._borderAlpha = cfg?.borderAlpha ?? 1
        this._borderWidth = cfg?.borderWidth ?? 1
        this._internal = scene.add.rectangle()
        this._updateFill()
        this._updateStroke()
    }

    get fillColor(): number | undefined { return this._fillColor; }
    set fillColor(value: number | undefined) { this._fillColor = value; this._updateFill() }
    private _fillColor?: number

    get fillAlpha(): number { return this._fillAlpha; }
    set fillAlpha(value: number) { this._fillAlpha = value; this._updateFill() }
    private _fillAlpha: number

    get borderColor(): number | undefined { return this._borderColor }
    set borderColor(value: number | undefined) { this._borderColor = value; this._updateStroke() }
    private _borderColor?: number

    get borderAlpha(): number { return this._borderAlpha }
    set borderAlpha(value: number) { this._borderAlpha = value; this._updateStroke() }
    private _borderAlpha: number

    get borderWidth(): number { return this._borderWidth; }
    set borderWidth(value: number) { this._borderWidth = value; this._updateStroke() }
    private _borderWidth: number

    protected afterReposition() {
        super.afterReposition()
        this._internal.setPosition(this.x, this.y)
        this._internal.setSize(this.width, this.height)
    }

    private _updateFill() {
        if (this._fillColor != undefined && this._fillAlpha > 0) {
            this._internal.setFillStyle(this._fillColor, this._fillAlpha)
        } else {
            this._internal.setFillStyle()
        }
    }

    private _updateStroke() {
        if (this._borderColor != undefined && this._borderWidth > 0 && this._borderAlpha > 0) {
            this._internal.setStrokeStyle(this._borderWidth, this._borderColor, this._borderAlpha)
        } else {
            this._internal.setStrokeStyle()
        }
    }

    private readonly _internal: Phaser.GameObjects.Rectangle
}