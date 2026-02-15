import {Scene} from "phaser";
import {Interactive, InteractiveConfig} from "./interactive.ts";

export type ScrollableConfig = {
    onScroll: (x: number, y: number) => void
} & InteractiveConfig

export class Scrollable extends Interactive {
    constructor(scene: Scene, cfg: ScrollableConfig) {
        super(scene, {...cfg, draggable: true});

        this._onScroll = cfg.onScroll;

        this.events.on('wheel', (_: any, __: number, dy: number) => {
            if (!this.enabled) return
            this.scrollPosition += dy / this.zoom;
        });

        this.events.on('dragstart', () => {
            if (!this.enabled) return
            this._dragTimestamp = Date.now();
            this._dragVelocity = 0;
        });

        this.events.on('drag', (_: any, __: number, dy: number) => {
            if (!this.enabled) return
            const now = Date.now();
            const delta = dy - this._dragPosition;
            const dt = now - this._dragTimestamp;
            const velocity = delta / (dt + 1);

            this._dragTimestamp = now;
            this._dragPosition = dy;
            this._dragVelocity = 0.8 * velocity + 0.2 * this._dragVelocity;
            this._updateContentPosition();
        });

        this.events.on('dragend', () => {
            if (!this.enabled) return
            this._scrollPosition = Phaser.Math.Clamp(
                this._scrollPosition - this._dragPosition, 0, this._maxScrollPosition);
            this._dragPosition = 0;
            this.scene.events.on('update', this._kineticScroll, this);
        });
    }

    setContentHeight(contentHeight: number) {
        this._maxScrollPosition = Math.max(0, contentHeight - this.height);
        this.scrollPosition = this._scrollPosition;
    }

    get scrollPosition() {
        return Phaser.Math.Clamp(this._scrollPosition - this._dragPosition, 0, this._maxScrollPosition);
    }
    set scrollPosition(pos: number) {
        this._scrollPosition = Phaser.Math.Clamp(pos, 0, this._maxScrollPosition);
        this._updateContentPosition();
    }
    get maxScrollPosition() { return this._maxScrollPosition; }

    scrollTo(pos: number) {
        this.scene.tweens.add({
            targets: this,
            scrollPosition: pos,
            duration: 400,
            ease: 'Cubic.easeOut',
        });
    }
    scrollToStart() { this.scrollTo(0); }
    scrollToEnd() { this.scrollTo(this._maxScrollPosition); }

    private _updateContentPosition() {
        this._onScroll(0, this.scrollPosition);
    }

    private _kineticScroll(_: number, delta: number) {
        this.scrollPosition -= delta * this._dragVelocity;
        this._dragVelocity *= 0.94;

        if (Math.abs(this._dragVelocity) < 0.002) {
            this._dragVelocity = 0;
            this.scene.events.off('update', this._kineticScroll, this)
        }
    }

    private readonly _onScroll: (x: number, y: number) => void;
    private _scrollPosition = 0;
    private _maxScrollPosition = 0;
    private _dragPosition = 0;
    private _dragVelocity = 0;
    private _dragTimestamp = 0;
}
