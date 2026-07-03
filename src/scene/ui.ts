import { ViewportMount } from "./viewport-mount.ts";
import { Theme, type ThemeConfig } from "../theme";
import { ResponsiveScene, ResponsiveSceneConfig } from "./responsive.ts";

export type Resources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};

export type UiSceneConfig = ResponsiveSceneConfig & {
  theme: ThemeConfig;
};

export class UiScene extends ResponsiveScene {
  constructor(cfg: UiSceneConfig) {
    super(cfg);
    const theme = new Theme(cfg.theme);
    this._theme = theme;
    const atlas = cfg.theme.resources.atlas;
    this._mount = new ViewportMount(this, theme, atlas, this.viewport.width, this.viewport.height);
  }

  preload() {
    const res = this._theme.resources;
    this.load.setPath(res.basePath);
    this.load.atlas(res.atlas, res.atlas + ".png", res.atlas + ".atlas");
    for (const font of res.fonts.names) {
      this.load.bitmapFont(font, res.fonts.atlas + ".png", font + ".bmfont");
    }
  }

  get root() {
    return this._mount.root;
  }

  get theme() {
    return this._theme;
  }

  create() {
    super.create();
    this.events.once("create", () => {
      this._mount.resolveLayout();
      this.game.scale.refresh();
      this.game.scale.on("resize", () =>
        this._mount.resize(this.viewport.width, this.viewport.height),
      );
    });
  }

  private readonly _theme: Theme;
  private readonly _mount: ViewportMount;
}
