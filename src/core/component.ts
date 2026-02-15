import {calcSize, RelativeSize, Size} from "../util/size.ts";
import {Position, RelativePosition} from "../util/position.ts";
import {calcOrigin, calcOriginOffsetFromCenter, Origin, OriginConfig, OriginX, OriginY} from "../util/origin.ts";
import {Scene} from "phaser";

export type ComponentConfig = RelativePosition & RelativeSize & OriginConfig & {
    visible?: boolean,
};

export type Anchor = Position & Size & Origin;

export class Component {
    constructor(scene: Scene, cfg?: ComponentConfig) {
        this.scene = scene;
        this._cfg = cfg ?? {}
        this._visible = cfg?.visible ?? true
        this._calcPosition()
    }
    readonly scene: Scene

    update() {}

    get visible() { return this._visible }
    set visible(value: boolean) {
        if (this._visible === value) return
        this._visible = value
        this.update()
    }
    private _visible: boolean;

    get x() { return this._position.x }
    get y() { return this._position.y }
    get left() { return this._position.x - Math.floor(this._size.width/2) }
    get right() { return this._position.x + Math.floor(this._size.width/2) }
    get top() { return this._position.y - Math.floor(this._size.height/2) }
    get bottom() { return this._position.y + Math.floor(this._size.height/2) }
    get width() { return this._size.width }
    get height() { return this._size.height }
    get originX() { return this._anchor.originX }
    get originY() { return this._anchor.originY }
    get zoom() { return this._zoom }

    get localX() { return this._cfg.x ?? 0 }
    set localX(x) { this._cfg.x = x; this.updatePosition() }
    get localY() { return this._cfg.y ?? 0 }
    set localY(y) { this._cfg.y = y; this.updatePosition() }
    setWidth(v: number) { this._cfg.width = v; this.updatePosition() }
    setHeight(v: number) { this._cfg.height = v; this.updatePosition() }

    updatePosition() {
        this._calcPosition()
        this.afterReposition()
        this.update()
    }

    reposition(anchor: Anchor, zoom: number) {
        this._anchor = anchor;
        this._zoom = zoom;
        this.updatePosition()
    }
    protected afterReposition() {}

    private readonly _cfg: ComponentConfig;
    private _anchor: Anchor = {
        x: 0, y: 0,
        height: 0, width: 0,
        originX: OriginX.Center,
        originY: OriginY.Center
    }
    private _zoom = 1
    private _position!: Position;
    private _size!: Size;

    private _calcPosition() {
        const anchor = this._anchor;
        this._size = calcSize(this._cfg, anchor);
        const origin = calcOrigin(this._cfg, anchor);
        const offset = calcOriginOffsetFromCenter(this._size, origin);
        const localX = (this._cfg.x ?? 0) * (offset.x > 0 ? -1 : 1)
        const localY = (this._cfg.y ?? 0) * (offset.y > 0 ? -1 : 1)
        this._position = {
            x: anchor.x + localX - offset.x,
            y: anchor.y + localY - offset.y
        }
    }
}
