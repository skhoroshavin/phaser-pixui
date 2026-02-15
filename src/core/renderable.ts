import {Component, ComponentConfig} from "./component.ts";
import {Scene} from "phaser";

type Transform = Phaser.GameObjects.Components.Transform;
type Visible = Phaser.GameObjects.Components.Visible;
type Filters = Phaser.GameObjects.Components.Filters;
type Rectangle = Phaser.GameObjects.Rectangle;

export type RenderableConfig = ComponentConfig & {
    tint?: number,
};

export interface Tint {
    isTinted: boolean;
    tint: number;
    setTint(color: number): void;
    clearTint(): void;
}

export class Renderable<Internal extends Transform & Visible & Filters & Tint>
extends Component {
    constructor(scene: Scene, cfg: RenderableConfig | undefined, internal: Internal) {
        super(scene, cfg);
        this.internal = internal;
        this.tint = cfg?.tint;
    }
    readonly internal: Internal;

    get visible() { return this.internal.visible }
    set visible(value: boolean) { this.internal.visible = value }

    get tint(): number | undefined { return this.internal.isTinted ? this.internal.tint : undefined }
    set tint(value: number | undefined) {
        if (value === undefined) this.internal.clearTint()
        else this.internal.setTint(value)
    }

    setMask(mask: Mask) {
        if (!this.internal.filters) {
            this.internal.enableFilters()
        }
        // @ts-ignore
        this.internal.filters?.internal.addMask(mask._internal)
    }

    protected afterReposition() {
        this.internal.setPosition(this.x, this.y)
    }
}

export class Mask extends Component {
    constructor(scene: Scene, cfg?: ComponentConfig) {
        super(scene, cfg);
        this._internal = scene.add.rectangle()
        this._internal.setFillStyle(0)
        this._internal.setVisible(false)
    }

    protected afterReposition() {
        this._internal.setPosition(this.x, this.y)
        this._internal.setSize(this.width, this.height)
    }

    private readonly _internal: Rectangle
}
