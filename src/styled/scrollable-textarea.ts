import { Mask } from '../core/mask.ts'
import { Scrollable } from '../core/scrollable.ts'
import type { InsertContext } from './context.ts'
import { TextArea, TextAreaConfig } from './textarea.ts'

export type ScrollableTextAreaConfig = TextAreaConfig

export class ScrollableTextArea extends TextArea {
    constructor(ctx: InsertContext, cfg: ScrollableTextAreaConfig) {
        super(ctx, cfg)

        this._mask = this.insert.mask()
        this._text.setMask(this._mask)

        this._scroller = this.insert.scrollable({
            onScroll: (_: number, y: number) => {
                if (!this._text) return
                this._text.localY = -y
            },
        })

        this._scroller.setContentHeight(this._text.height)
    }

    get text() {
        return super.text
    }
    set text(value: string) {
        super.text = value
        this._text.setWidth(this._mask.width)
        this._scroller.setContentHeight(this._text.height)
        this.scrollToEnd()
    }

    get maxScrollPosition() {
        return this._scroller.maxScrollPositionY
    }
    scrollTo(pos: number) {
        this._scroller.scrollTo(0, pos)
    }
    scrollToEnd() {
        this._scroller.scrollToEnd()
    }

    protected override updatePosition() {
        super.updatePosition()
        this._text.setWidth(this._mask.width)
        this._scroller.setContentHeight(this._text.height)
    }

    private readonly _scroller: Scrollable
    private readonly _mask: Mask
}
