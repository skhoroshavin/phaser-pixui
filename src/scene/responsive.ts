import { Scene } from 'phaser';
import {Size} from "../util/size.ts";

export type ResponsiveSceneConfig = Phaser.Types.Scenes.SettingsConfig & {
    // Constraints on effective viewport size. Default is minimum 426x240.
    viewportConstraints?: ViewportConstraints;
    // Specifies function that returns world size, which is later used to
    // set camera boundaries. If undefined world will be assumed to have a
    // size of a viewport.
    getWorldSize?: () => Size | undefined;
}

export type ViewportConstraints = {
    width?: number;
    height?: number;
    mode?: ConstraintMode;
}

export enum ConstraintMode {
    Minimum,
    Maximum,
}

export class ResponsiveScene extends Scene
{
    constructor (cfg: ResponsiveSceneConfig) {
        super(cfg);

        this.viewportConstraints = cfg.viewportConstraints || {
            width: 320,
            height: 240
        }
        this._worldSize = cfg.getWorldSize
        this._updateViewport()
    }

    readonly viewportConstraints: ViewportConstraints;

    get zoomAdjustment() { return this._zoomAdjustment }
    set zoomAdjustment (value: number) {
        this._zoomAdjustment = value
        this._updateViewport()
        this._updateCamera()
    }
    private _zoomAdjustment = 0;

    get zoom() { return this._zoom }
    get viewport() { return this._viewport }

    create() {
        this._updateCamera()
        this.scale.on("resize", () => {
            this._updateViewport()
            this._updateCamera()
        })
    }

    private _updateViewport() {
        const constraints = this.viewportConstraints;
        if (constraints.width !== undefined || constraints.height !== undefined) {
            const zw = constraints.width ? this._getCanvasWidth() / constraints.width : undefined
            const zh = constraints.height ? this._getCanvasHeight() / constraints.height : undefined
            const zmin = zw === undefined ? zh! : (zh === undefined ? zw : Math.min(zw, zh));
            const zmax = zw === undefined ? zh! : (zh === undefined ? zw : Math.max(zw, zh));
            const z = constraints.mode === ConstraintMode.Maximum ? Math.ceil(zmax) : Math.floor(zmin)
            this._zoom = Math.max(1, z + this._zoomAdjustment)
        } else {
            this._zoom = 1
        }

        this._viewport = {
            width: Math.ceil(this._getCanvasWidth() / this._zoom),
            height: Math.ceil(this._getCanvasHeight() / this._zoom),
        }
    }

    private _updateCamera() {
        this.cameras.main.setZoom(this._zoom)

        const worldSize = this._worldSize?.call(this)
        if (worldSize) {
            const minX = Math.min(0, Math.floor(0.5 * (worldSize.width - this._viewport.width)))
            const minY = Math.min(0, Math.floor(0.5 * (worldSize.height - this._viewport.height)))
            this.cameras.main.setBounds(minX, minY, worldSize.width, worldSize.height);
        } else {
            this.cameras.main.setBounds(0, 0, this._viewport.width, this._viewport.height)
        }
    }

    private _getCanvasWidth(): number {
        return (typeof window !== 'undefined' ? window.innerWidth : 800) * this._getDevicePixelRatio();
    }

    private _getCanvasHeight(): number {
        return (typeof window !== 'undefined' ? window.innerHeight : 600) * this._getDevicePixelRatio();
    }

    private _getDevicePixelRatio(): number {
        return typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    }

    private _zoom = 1;
    private _viewport!: Size
    private _worldSize?: () => Size | undefined;
}
