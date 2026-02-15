import {findStyle, resolveColor, ThemeConfig} from "../theme/theme.ts";
import {Scene} from "phaser";
import {BitmapText} from "../core/bitmaptext.ts";
import {StyledComponent, StyledComponentConfig} from "./styled.ts";
import {Clickable, ClickableState} from "../core/clickable.ts";
import {Image} from "../core/image.ts";
import {TextAlign} from "../util/align.ts";

export type ButtonConfig = {
    enabled?: boolean,
    text?: string,
    onClick: () => void,
} & StyledComponentConfig

export class Button extends StyledComponent {
    constructor(scene: Scene, theme: ThemeConfig, cfg: ButtonConfig) {
        const style = findStyle('Button', cfg.style, theme.button)
        super(scene, theme, {
            width: cfg.width ?? style.defaultWidth,
            height: cfg.height ?? style.defaultHeight,
            ...cfg
        });

        this._clickable = this.insert.clickable({
            shape: style.shape,
            enabled: cfg.enabled,
            onClick: cfg.onClick,
            onUpdate: () => this.update(),
        })

        this._buttonUp = this.insert.image({
            texture: theme.resources.texture,
            frame: style.frameUp!,
        })
        this._buttonDown = this.insert.image({
            texture: theme.resources.texture,
            frame: style.frameDown!,
        })
        if (style.frameHover) {
            this._buttonHover = this.insert.image({
                texture: theme.resources.texture,
                frame: style.frameHover,
            })
        }
        if (style.frameDisabled) {
            this._buttonDisabled = this.insert.image({
                texture: theme.resources.texture,
                frame: style.frameDisabled,
            })
        }

        if (cfg.text) {
            this._buttonText = this.insert.bitmapText({
                text: cfg.text,
                align: TextAlign.Middle,
                font: style.fontName!,
                size: style.fontSize,
            })
            
            this._defaultTint = resolveColor(style.fontTint, theme.palette)
            this._disabledTint = resolveColor(style.fontTintDisabled, theme.palette)
        }
    }

    get visible() { return this._clickable.visible }
    set visible(value: boolean) { this._clickable.visible = value }

    get enabled() { return this._clickable.enabled }
    set enabled(value: boolean) { this._clickable.enabled = value }

    update() {
        super.update()

        if (!this.visible) {
            this._setVisible(null)
            return
        }

        switch (this._clickable.state) {
            case ClickableState.Default:
                this._setVisible(this._buttonUp)
                if (this._buttonText) this._buttonText.tint = this._defaultTint
                break
            case ClickableState.Pressed:
                this._setVisible(this._buttonDown)
                if (this._buttonText) this._buttonText.tint = this._defaultTint
                break
            case ClickableState.Hovered:
                if (this._buttonHover) {
                    this._setVisible(this._buttonHover)
                } else {
                    this._setVisible(this._buttonUp)
                }
                if (this._buttonText) this._buttonText.tint = this._defaultTint
                break
            case ClickableState.Disabled:
                if (this._buttonDisabled) {
                    this._setVisible(this._buttonDisabled)
                } else {
                    this._setVisible(this._buttonUp)
                }
                if (this._buttonText) this._buttonText.tint = this._disabledTint
                break
        }
    }

    protected afterReposition() {
        super.afterReposition();
        this._clickable.setHeight(this._buttonUp.height)
    }

    private _setVisible(obj: Image | null) {
        this._buttonUp.visible = this.visible && (obj == this._buttonUp)
        this._buttonDown.visible = this.visible && (obj == this._buttonDown)
        if (this._buttonHover)
            this._buttonHover.visible = this.visible && (obj == this._buttonHover)
        if (this._buttonDisabled)
            this._buttonDisabled.visible = this.visible && (obj == this._buttonDisabled)
        if (this._buttonText)
            this._buttonText.visible = this.visible
    }

    private readonly _clickable: Clickable
    private readonly _buttonUp: Image
    private readonly _buttonDown: Image
    private readonly _buttonHover?: Image
    private readonly _buttonDisabled?: Image

    private readonly _buttonText?: BitmapText
    private readonly _defaultTint?: number
    private readonly _disabledTint?: number
}
