import {ThemeConfig} from "../theme/theme.ts";
import {Button, ButtonConfig} from "./button.ts";
import {TextArea, TextAreaConfig} from "./textarea.ts";
import {ScrollableTextArea, ScrollableTextAreaConfig} from "./scrollable-textarea.ts";
import {ComponentFactory, ComponentFactoryConfig} from "../core/factory.ts";
import {Progress, ProgressConfig} from "./progress.ts";
import {Scene} from "phaser";
import {Container} from "../core/container.ts";
import {OriginX, OriginY} from "../util/origin.ts";

export type StyledFactoryConfig = {
    theme: ThemeConfig
} & ComponentFactoryConfig;

export class StyledFactory extends ComponentFactory {
    constructor(cfg: StyledFactoryConfig) {
        super(cfg);
        this.theme = cfg.theme;
    }
    readonly theme: ThemeConfig;

    button(cfg: ButtonConfig) : Button {
        const button = new Button(this.scene, this.theme, cfg)
        this.container.attach(button, this.originX, this.originY)
        return button;
    }

    progress(cfg: ProgressConfig) : Progress {
        const progress = new Progress(this.scene, this.theme, cfg)
        this.container.attach(progress, this.originX, this.originY)
        return progress;
    }

    textArea(cfg: TextAreaConfig): TextArea {
        const textArea = new TextArea(this.scene, this.theme, cfg)
        this.container.attach(textArea, this.originX, this.originY)
        return textArea;
    }

    scrollableTextArea(cfg: ScrollableTextAreaConfig): ScrollableTextArea {
        const scrollableTextArea = new ScrollableTextArea(this.scene, this.theme, cfg)
        this.container.attach(scrollableTextArea, this.originX, this.originY)
        return scrollableTextArea;
    }
}

export class StyledMultiFactory extends StyledFactory {
    constructor(scene: Scene, container: Container, theme: ThemeConfig) {
        super({scene, container, theme, originX: OriginX.Center, originY: OriginY.Center})
        this.center = new StyledFactory({scene, container, theme, originX: OriginX.Center, originY: OriginY.Center})
        this.left = new StyledFactory({scene, container, theme, originX: OriginX.Left, originY: OriginY.Center})
        this.right = new StyledFactory({scene, container, theme, originX: OriginX.Right, originY: OriginY.Center})
        this.top = new StyledFactory({scene, container, theme, originX: OriginX.Center, originY: OriginY.Top})
        this.bottom = new StyledFactory({scene, container, theme, originX: OriginX.Center, originY: OriginY.Bottom})
        this.topLeft = new StyledFactory({scene, container, theme, originX: OriginX.Left, originY: OriginY.Top})
        this.topRight = new StyledFactory({scene, container, theme, originX: OriginX.Right, originY: OriginY.Top})
        this.bottomLeft = new StyledFactory({scene, container, theme, originX: OriginX.Left, originY: OriginY.Bottom})
        this.bottomRight = new StyledFactory({scene, container, theme, originX: OriginX.Right, originY: OriginY.Bottom})
    }

    at(originX: OriginX, originY: OriginY) {
        switch(originX) {
            case OriginX.Center: switch (originY) {
                case OriginY.Center: return this.center
                case OriginY.Top: return this.top
                case OriginY.Bottom: return this.bottom
            }
            case OriginX.Left: switch (originY) {
                case OriginY.Center: return this.left
                case OriginY.Top: return this.topLeft
                case OriginY.Bottom: return this.bottomLeft
            }
            case OriginX.Right: switch (originY) {
                case OriginY.Center: return this.right
                case OriginY.Top: return this.topRight
                case OriginY.Bottom: return this.bottomRight
            }
        }
    }

    readonly center: StyledFactory
    readonly left: StyledFactory
    readonly right: StyledFactory
    readonly top: StyledFactory
    readonly bottom: StyledFactory
    readonly topLeft: StyledFactory
    readonly topRight: StyledFactory
    readonly bottomLeft: StyledFactory
    readonly bottomRight: StyledFactory
}
