import { ViewportMount } from "../mounts/viewport-mount.ts";
import { ResponsiveScene, ResponsiveSceneConfig } from "./responsive.ts";
import { RootComponent } from "../core/component.ts";

export type Resources = {
  basePath?: string;
  atlas: string;
  fonts: { atlas: string; names: string[] };
};

export type UiSceneConfig = ResponsiveSceneConfig & {
  resources: Resources;
};

export class UiScene extends ResponsiveScene {
  constructor(cfg: UiSceneConfig) {
    super(cfg);
    this._resources = cfg.resources;
    this._mount = new ViewportMount(this);
    this._root = new RootComponent(this._mount, {
      width: this.viewport.width,
      height: this.viewport.height,
    });
  }

  preload() {
    const res = this._resources;
    this.load.setPath(res.basePath);
    this.load.atlas(res.atlas, res.atlas + ".png", res.atlas + ".atlas");
    for (const font of res.fonts.names) {
      this.load.bitmapFont(font, res.fonts.atlas + ".png", font + ".bmfont");
    }
  }

  get root() {
    return this._root;
  }

  create() {
    super.create();
    this.events.once("create", () => {
      this._mount.resolveLayout();
      this.game.scale.refresh();
      this.game.scale.on("resize", () =>
        this._root.resize(this.viewport.width, this.viewport.height),
      );
    });
  }

  private readonly _resources: Resources;
  private readonly _mount: ViewportMount;
  private readonly _root: RootComponent;
}
