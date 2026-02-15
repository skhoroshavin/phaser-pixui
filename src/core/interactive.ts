import {Component, ComponentConfig} from "./component.ts";
import {Scene, Geom} from "phaser";

type Rectangle = Phaser.Geom.Rectangle;
type Ellipse = Phaser.Geom.Ellipse;
type Container = Phaser.GameObjects.Container;
type EventEmitter = Phaser.Events.EventEmitter;
type Polygon = Phaser.Geom.Polygon;

const { Rectangle, Ellipse, Polygon } = Geom;

export type InteractiveConfig = {
    enabled?: boolean;
    draggable?: boolean;
    shape?: Shape;
    onUpdate?: () => void;
} & ComponentConfig;

export type Shape = 'rect' | 'diamond' | 'ellipse';

export class Interactive extends Component {
    constructor(scene: Scene, cfg: InteractiveConfig) {
        super(scene, cfg);

        this._enabled = cfg.enabled ?? true
        this._draggable = cfg.draggable ?? false
        this._onUpdate = cfg.onUpdate

        switch (cfg.shape ?? 'rect') {
            case 'rect': this._hitRect = new Rectangle(); break;
            case 'diamond': this._hitDiamond = new Polygon(); break;
            case 'ellipse': this._hitEllipse = new Ellipse(); break;
        }

        this._hitArea = scene.make.container({})
    }

    get enabled() { return this._enabled }
    set enabled(value: boolean) {
        if (this._enabled === value) return
        this._enabled = value
        this.update()
    }
    private _enabled: boolean

    get events(): EventEmitter { return this._hitArea }
    private readonly _draggable: boolean;
    private readonly _hitArea: Container

    get isDesktop() { return this.scene.sys.game.device.os.desktop }

    update() {
        this._updateInteractive(this.visible)
        if (!this._onUpdate) return
        // During the first update of an interactive component, a controlled
        // component is usually not yet constructed, so we skip this update.
        // However, the factory will still call controlled component update,
        // right after it is constructed.
        if (!this._firstUpdate) this._onUpdate()
        this._firstUpdate = false;
    }
    private readonly _onUpdate?: () => void
    private _firstUpdate = true

    protected afterReposition() {
        if (this._hitRect) {
            this._hitRect.setPosition(this.left, this.top);
            this._hitRect.setSize(this.width, this.height);
        }
        if (this._hitDiamond) {
            this._hitDiamond.setTo([
                this.x, this.top,
                this.right, this.y,
                this.x, this.bottom,
                this.left, this.y
            ])
        }
        if (this._hitEllipse) {
            this._hitEllipse.setPosition(this.x, this.y)
            this._hitEllipse.setSize(this.width, this.height)
        }
    }
    private readonly _hitRect?: Rectangle
    private readonly _hitDiamond?: Polygon
    private readonly _hitEllipse?: Ellipse

    private _updateInteractive(value: boolean) {
        if (value === this._interactive) return
        this._interactive = value

        if (!value) {
            this._hitArea.disableInteractive()
            return
        }

        const config = {
            draggable: this._draggable,
        }
        if (this._hitRect) {
            this._hitArea.setInteractive({
                hitArea: this._hitRect,
                hitAreaCallback: Rectangle.Contains,
                ...config,
            })
        }
        if (this._hitDiamond) {
            this._hitArea.setInteractive({
                hitArea: this._hitDiamond,
                hitAreaCallback: Polygon.Contains,
                ...config,
            })
        }
        if (this._hitEllipse) {
            this._hitArea.setInteractive({
                hitArea: this._hitEllipse,
                hitAreaCallback: Ellipse.Contains,
                ...config,
            })
        }
    }
    private _interactive?: boolean
}
