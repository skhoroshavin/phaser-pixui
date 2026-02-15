import {ThemeConfig, initTheme} from "../theme/theme.ts";
import {ResponsiveScene, ResponsiveSceneConfig} from "./responsive.ts";
import {OriginX, OriginY} from "../util/origin.ts";
import {Container} from "../core/container.ts";
import {StyledMultiFactory} from "../styled/factory.ts";

export type UiSceneConfig = ResponsiveSceneConfig & {
    theme: ThemeConfig;
};

export class UiScene extends ResponsiveScene
{
    constructor(cfg: UiSceneConfig) {
        super(cfg);

        this.theme = cfg.theme;
        this._root = new Container(this)
        this._updateRoot()
        this.insert = new StyledMultiFactory(this, this._root, this.theme)
    }

    preload() {
        const res = this.theme.resources
        this.load.setPath(res.basePath)
        this.load.atlas(res.texture, res.texture + '.png', res.texture + '.atlas')
        for (const font of res.fonts) {
            this.load.bitmapFont(font)
        }
    }

    readonly theme: ThemeConfig
    readonly insert: StyledMultiFactory

    create() {
        super.create()
        initTheme(this.theme, this.textures.get(this.theme.resources.texture))
        this.game.scale.on("resize", this._updateRoot, this)
    }

    private _updateRoot() {
        this._root.reposition({
            x: 0,
            y: 0,
            originX: OriginX.Left,
            originY: OriginY.Top,
            ...this.viewport
        }, this.zoom)
    }
    private readonly _root: Container
}
