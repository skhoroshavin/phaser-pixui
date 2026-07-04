import { ViewportMount } from "../mounts/viewport-mount.ts";
import { ResponsiveScene, type ResponsiveSceneConfig } from "./responsive.ts";
import { RootComponent } from "../core/component.ts";

export class UiScene extends ResponsiveScene {
  constructor(cfg: ResponsiveSceneConfig) {
    super(cfg);
    this._mount = new ViewportMount(this);
    this._root = new RootComponent(this._mount, {
      width: this.viewport.width,
      height: this.viewport.height,
    });
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

  private readonly _mount: ViewportMount;
  private readonly _root: RootComponent;
}
