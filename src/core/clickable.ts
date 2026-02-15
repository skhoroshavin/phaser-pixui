import {Interactive, InteractiveConfig} from "./interactive.ts";
import {Scene} from "phaser";

export type ClickableConfig = {
   onClick?: () => void,
} & InteractiveConfig

export enum ClickableState {
    Default, Hovered, Pressed, Disabled
}

export class Clickable extends Interactive {
    constructor(scene: Scene, cfg: ClickableConfig = {}) {
        super(scene, cfg);

        this._onClick = cfg.onClick

        this.events.on('pointerdown', this._onPointerDown, this);
        this.events.on('pointerout', this._onPointerOut, this);
        this.events.on('pointerup', this._onPointerUp, this);
        this.events.on('pointerover', this._onPointerOver, this);
    }

    get state(): ClickableState { return this.enabled ? this._state : ClickableState.Disabled }
    get hovered() { return this.state == ClickableState.Hovered }
    get pressed() { return this.state == ClickableState.Pressed }
    private _state: ClickableState = ClickableState.Default

    update() {
        if (!this.enabled) this._state = ClickableState.Default
        super.update()
    }

    private _onPointerDown() {
        if (!this.enabled) return
        this._setState(ClickableState.Pressed)
    }

    private _onPointerUp() {
        if (!this.enabled) return
        if (this.pressed && this._onClick) this._onClick()
        if (this.isDesktop) return this._setState(ClickableState.Hovered)
        else this._setState(ClickableState.Default)
    }
    private readonly _onClick?: () => void

    private _onPointerOut() {
        if (!this.enabled) return
        this._setState(ClickableState.Default)
    }

    private _onPointerOver() {
        if (!this.enabled || !this.isDesktop) return
        this._setState(ClickableState.Hovered)
    }

    private _setState(state: ClickableState) {
        if (this._state == state) return
        this._state = state
        this.update()
    }
}
