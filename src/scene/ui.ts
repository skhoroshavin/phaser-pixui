import { ViewportMount } from "../core2/viewport-mount.ts";
import { Theme, type ThemeConfig as Theme2Config } from "../theme2";
import { InsertContext } from "../styled/context.ts";
import { StyledComponent } from "../styled/styled.ts";
import { ThemeConfig, initTheme } from "../theme/theme.ts";
import { OriginX, OriginY } from "../util/origin.ts";
import { ResponsiveScene, ResponsiveSceneConfig } from "./responsive.ts";

export type UiSceneConfig = ResponsiveSceneConfig & {
  theme: ThemeConfig;
  theme2: Theme2Config;
};

export class UiScene extends ResponsiveScene {
  constructor(cfg: UiSceneConfig) {
    super(cfg);

    this.theme = cfg.theme;

    const theme = new Theme(cfg.theme2);
    this._mount = new ViewportMount(this, theme, this.viewport.width, this.viewport.height);

    const ctx = new InsertContext(this, this.theme);
    this._root = new StyledComponent(ctx);
    this._updateRoot();
  }

  preload() {
    const res = this.theme.resources;
    this.load.setPath(res.basePath);
    this.load.atlas(res.atlas, res.atlas + ".png", res.atlas + ".atlas");
    for (const font of res.fonts.names) {
      this.load.bitmapFont(font, res.fonts.atlas + ".png", font + ".bmfont");
    }
  }

  readonly theme: ThemeConfig;
  get insert() {
    return this._root.insert;
  }

  get root() {
    return this._mount.root;
  }

  create() {
    super.create();
    initTheme(this.theme);
    this.events.once("create", () => {
      this._root.initialize();
      this._mount.layout();
      this.game.scale.refresh();
      this.game.scale.on("resize", this._updateRoot, this);
    });
  }

  private _updateRoot() {
    this._root.reposition(
      {
        x: 0,
        y: 0,
        originX: OriginX.Left,
        originY: OriginY.Top,
        ...this.viewport,
      },
      this.zoom,
    );
    this._mount.resize(this.viewport.width, this.viewport.height);
  }

  private readonly _root: StyledComponent;
  private readonly _mount: ViewportMount;
}
