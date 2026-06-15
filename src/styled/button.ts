import { BitmapText } from '../core/bitmaptext.ts'
import { Clickable, ClickableState } from '../core/clickable.ts'
import { Image } from '../core/image.ts'
import { findStyle, resolveColor } from '../theme/theme.ts'
import { TextAlign } from '../util/align.ts'
import type { InsertContext } from './context.ts'
import { StyledComponent, StyledComponentConfig } from './styled.ts'

export type ButtonConfig = {
    text?: string
    onClick: () => void
} & StyledComponentConfig

export class Button extends StyledComponent {
    constructor(ctx: InsertContext, cfg: ButtonConfig) {
        const style = findStyle('Button', cfg.style, ctx.theme.button)
        super(ctx, {
            width: cfg.width ?? style.defaultWidth,
            height: cfg.height ?? style.defaultHeight,
            ...cfg,
        })

        this._clickable = this.insert.clickable({
            shape: style.shape,
            onClick: cfg.onClick,
            onUpdate: () => this._updateState(),
        })

        this._buttonUp = this.insert.image({
            texture: ctx.theme.resources.atlas,
            frame: style.frameUp!,
            tileX: style.tileX,
            tileY: style.tileY,
        })
        this._buttonDown = this.insert.image({
            texture: ctx.theme.resources.atlas,
            frame: style.frameDown!,
            tileX: style.tileX,
            tileY: style.tileY,
        })
        if (!this._buttonUp.scalableX) this.setWidth(this._buttonUp.width)
        if (!this._buttonUp.scalableY) this.setHeight(this._buttonUp.height)

        if (style.frameHover) {
            this._buttonHover = this.insert.image({
                texture: ctx.theme.resources.atlas,
                frame: style.frameHover,
                tileX: style.tileX,
                tileY: style.tileY,
            })
        }
        if (style.frameDisabled) {
            this._buttonDisabled = this.insert.image({
                texture: ctx.theme.resources.atlas,
                frame: style.frameDisabled,
                tileX: style.tileX,
                tileY: style.tileY,
            })
        }

        if (cfg.text) {
            this._buttonText = this.insert.bitmapText({
                text: cfg.text,
                align: TextAlign.Center,
                font: style.fontName!,
                size: style.fontSize,
            })

            this._defaultTint = resolveColor(style.fontTint, ctx.theme.palette)
            this._disabledTint = resolveColor(style.fontTintDisabled, ctx.theme.palette)
        }
    }

    protected override updateVisible(visible: boolean) {
        super.updateVisible(visible)
        this._updateState()
    }

    protected override updatePosition() {
        super.updatePosition()
        this._clickable.setHeight(this._buttonUp.height)
        this._updateState()
    }

    private _updateState() {
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

    private _setVisible(obj: Image | null) {
        this._buttonUp.visible = obj === this._buttonUp
        this._buttonDown.visible = obj === this._buttonDown
        if (this._buttonHover) this._buttonHover.visible = obj === this._buttonHover
        if (this._buttonDisabled) this._buttonDisabled.visible = obj === this._buttonDisabled
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
