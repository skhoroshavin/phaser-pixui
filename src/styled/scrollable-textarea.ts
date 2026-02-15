import {findStyle, ThemeConfig} from "../theme/theme.ts";
import {Scene} from "phaser";
import {Scrollable} from "../core/scrollable.ts";
import {TextArea, TextAreaConfig} from "./textarea.ts";

export type ScrollableTextAreaConfig = TextAreaConfig

export class ScrollableTextArea extends TextArea {
    constructor(scene: Scene, theme: ThemeConfig, cfg: ScrollableTextAreaConfig) {
        super(scene, theme, cfg);
        
        const style = findStyle('TextArea', cfg.style, theme.textArea)
        const paddingX = style.paddingX!
        const paddingY = style.paddingY!
        const paddedWidth = - 2 * paddingX;
        const paddedHeight = - 2 * paddingY;

        // Apply mask to the text element
        this._mask = this.insert.mask({
            width: paddedWidth,
            height: paddedHeight,
        });
        this._text.setMask(this._mask);

        // Initialize scrollable functionality
        this._scroller = this.insert.scrollable({
            width: paddedWidth,
            height: paddedHeight,
            onScroll: (_, y) => {
                if (!this._text) return
                this._text.localY = paddingY - y
            }
        })

        this._scroller.setContentHeight(this._text.height)
    }

    get text() { return super.text }
    set text(value: string) {
        super.text = value;
        this._scroller.setContentHeight(this._text.height)
        this.scrollToEnd()
    }

    get maxScrollPosition() { return this._scroller.maxScrollPosition }
    scrollTo(pos: number) { this._scroller.scrollTo(pos) }
    scrollToStart() { this._scroller.scrollToStart() }
    scrollToEnd() { this._scroller.scrollToEnd() }

    protected afterReposition() {
        super.afterReposition();
        this._text.setWidth(this._mask.width)
        this._scroller.setContentHeight(this._text.height)
    }

    private readonly _scroller: Scrollable;
    private readonly _mask: any;
}