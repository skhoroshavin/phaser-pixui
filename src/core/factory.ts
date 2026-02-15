import {Origin, OriginX, OriginY} from "../util/origin.ts";
import {Scene} from "phaser";
import {Container} from "./container.ts";
import {Interactive, InteractiveConfig} from "./interactive.ts";
import {BitmapText, BitmapTextConfig} from "./bitmaptext.ts";
import {Image, ImageConfig} from "./image.ts";
import {Clickable, ClickableConfig} from "./clickable.ts";
import {ComponentConfig} from "./component.ts";
import {Mask} from "./renderable.ts";
import {Scrollable, ScrollableConfig} from "./scrollable.ts";
import {Rectangle, RectangleConfig} from "./rectangle.ts";

export type ComponentFactoryConfig = Origin & {
    scene: Scene,
    container: Container,
}

export class ComponentFactory {
    constructor(cfg: ComponentFactoryConfig) {
        this.scene = cfg.scene
        this.container = cfg.container
        this.originX = cfg.originX
        this.originY = cfg.originY
    }

    readonly scene: Scene
    readonly container: Container
    readonly originX: OriginX
    readonly originY: OriginY

    interactive(cfg: InteractiveConfig = {}): Interactive {
        const interactive = new Interactive(this.scene, cfg)
        this.container.attach(interactive, this.originX, this.originY)
        return interactive
    }

    clickable(cfg: ClickableConfig = {}): Clickable {
        const clickable = new Clickable(this.scene, cfg)
        this.container.attach(clickable, this.originX, this.originY)
        return clickable
    }

    scrollable(cfg: ScrollableConfig): Scrollable {
        const scrollable = new Scrollable(this.scene, cfg)
        this.container.attach(scrollable, this.originX, this.originY)
        return scrollable
    }

    rectangle(cfg?: RectangleConfig): Rectangle {
        const rectangle = new Rectangle(this.scene, cfg)
        this.container.attach(rectangle, this.originX, this.originY)
        return rectangle
    }

    image(cfg: ImageConfig): Image {
        const image = new Image(this.scene, cfg)
        this.container.attach(image, this.originX, this.originY)
        return image
    }

    bitmapText(cfg: BitmapTextConfig): BitmapText {
        const text = new BitmapText(this.scene, cfg)
        this.container.attach(text, this.originX, this.originY)
        return text
    }

    mask(cfg?: ComponentConfig): Mask {
        const mask = new Mask(this.scene, cfg)
        this.container.attach(mask, this.originX, this.originY)
        return mask
    }
}

export class ComponentMultiFactory extends ComponentFactory {
    constructor(scene: Scene, container: Container) {
        super({scene, container, originX: OriginX.Center, originY: OriginY.Center})
        this.center = new ComponentFactory({scene, container, originX: OriginX.Center, originY: OriginY.Center,})
        this.left = new ComponentFactory({scene, container, originX: OriginX.Left, originY: OriginY.Center,})
        this.right = new ComponentFactory({scene, container, originX: OriginX.Right, originY: OriginY.Center,})
        this.top = new ComponentFactory({scene, container, originX: OriginX.Center, originY: OriginY.Top,})
        this.bottom = new ComponentFactory({scene, container, originX: OriginX.Center, originY: OriginY.Bottom,})
        this.topLeft = new ComponentFactory({scene, container, originX: OriginX.Left, originY: OriginY.Top,})
        this.topRight = new ComponentFactory({scene, container, originX: OriginX.Right, originY: OriginY.Top,})
        this.bottomLeft = new ComponentFactory({scene, container, originX: OriginX.Left, originY: OriginY.Bottom,})
        this.bottomRight = new ComponentFactory({scene, container, originX: OriginX.Right, originY: OriginY.Bottom,})
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

    readonly center: ComponentFactory
    readonly left: ComponentFactory
    readonly right: ComponentFactory
    readonly top: ComponentFactory
    readonly bottom: ComponentFactory
    readonly topLeft: ComponentFactory
    readonly topRight: ComponentFactory
    readonly bottomLeft: ComponentFactory
    readonly bottomRight: ComponentFactory
}