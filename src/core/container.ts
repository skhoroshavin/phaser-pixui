import {Anchor, Component, ComponentConfig} from "./component.ts";
import {calcOriginOffsetFromCenter, Origin, OriginX, OriginY} from "../util/origin.ts";
import {Scene} from "phaser";
import {ComponentMultiFactory} from "./factory.ts";

export class Container extends Component {
    constructor(scene: Scene, cfg?: ComponentConfig) {
        super(scene, cfg);
        this.insert = new ComponentMultiFactory(scene, this)
    }
    readonly insert: ComponentMultiFactory

    attach(components: Component | Component[], originX?: OriginX, originY?: OriginY) {
        if (!originX) { originX = OriginX.Center }
        if (!originY) { originY = OriginY.Center }
        const anchor = this._calcAnchor(originX, originY)
        if (Array.isArray(components)) {
            this._children.push(...components.map(c => ({originX, originY, component: c})))
            for (const c of components) {
                c.reposition(anchor, this.zoom)
            }
        } else {
            this._children.push({originX, originY, component: components})
            components.reposition(anchor, this.zoom)
        }
    }
    forEach(f: (c: Component) => void) {
        for (const c of this._children) {
            f(c.component)
        }
    }
    private _children: ({component: Component} & Origin)[] = []

    protected afterReposition() {
        for (const item of this._children) {
            item.component.reposition(this._calcAnchor(item.originX,item.originY), this.zoom)
        }
    }

    private _calcAnchor(originX: OriginX, originY: OriginY): Anchor {
        const offset = calcOriginOffsetFromCenter(this, {originX, originY})
        return {
            x: this.x + offset.x,
            y: this.y + offset.y,
            width: this.width,
            height: this.height,
            originX, originY,
        }
    }
}
