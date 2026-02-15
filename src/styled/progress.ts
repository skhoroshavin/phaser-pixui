import {findStyle, ThemeConfig} from "../theme/theme.ts";
import {Scene} from "phaser";
import {StyledComponent, StyledComponentConfig} from "./styled.ts";
import {OriginX} from "../util/origin.ts";
import {Image} from "../core/image.ts";

export type ProgressConfig = StyledComponentConfig

export class Progress extends StyledComponent {
    constructor(scene: Scene, theme: ThemeConfig, cfg: ProgressConfig) {
        super(scene, theme, cfg);
        const style = findStyle('Progress', cfg.style, theme.progress)

        this._bar = this.insert.left.image({
            texture: theme.resources.texture,
            frame: style.bar!,
            x: style.paddingX!,
            width: -2*style.paddingX!,
            height: -2*style.paddingY!,
            originX: OriginX.Left,
        })
        this._frame = this.insert.image({
            texture: theme.resources.texture,
            frame: style.frame!,
        })
        this._paddingX = style.paddingX!
    }

    get value() { return this._value }
    set value(value: number) { this._value = value; this._updateBar() }
    private _value = 0;

    update() {
        super.update()
        this._updateBar()
        this._frame.visible = this.visible
    }

    private _updateBar() {
        this._bar.visible = this.visible && this._value > 0
        this._bar.setWidth(this._value * (this.width - 2 * this._paddingX))
    }

    private _bar: Image
    private _frame: Image
    private readonly _paddingX;
}
