import { Scene } from "phaser";
import { Origin, OriginX, OriginY } from "../util/origin.ts";
import { BitmapText, BitmapTextConfig } from "./bitmaptext.ts";
import { Clickable, ClickableConfig } from "./clickable.ts";
import { Component, ComponentConfig } from "./component.ts";
import { Container } from "./container.ts";
import { Image, ImageConfig } from "./image.ts";
import { Interactive, InteractiveConfig } from "./interactive.ts";
import { Mask } from "./mask.ts";
import { Rectangle, RectangleConfig } from "./rectangle.ts";
import { Scrollable, ScrollableConfig } from "./scrollable.ts";

export type ComponentFactoryConfig = Origin & {
  scene: Scene;
};

export class ComponentFactory {
  constructor(cfg: ComponentFactoryConfig) {
    this.scene = cfg.scene;
    this.originX = cfg.originX;
    this.originY = cfg.originY;
  }

  readonly scene: Scene;
  readonly originX: OriginX;
  readonly originY: OriginY;

  setContainer(container: Container) {
    this._container = container;
  }
  protected _container!: Container;

  interactive(cfg?: InteractiveConfig): Interactive {
    return this.create(Interactive, cfg);
  }

  clickable(cfg?: ClickableConfig): Clickable {
    return this.create(Clickable, cfg);
  }

  scrollable(cfg: ScrollableConfig): Scrollable {
    return this.create(Scrollable, cfg);
  }

  rectangle(cfg?: RectangleConfig): Rectangle {
    return this.create(Rectangle, cfg);
  }

  image(cfg: ImageConfig): Image {
    return this.create(Image, cfg);
  }

  bitmapText(cfg: BitmapTextConfig): BitmapText {
    return this.create(BitmapText, cfg);
  }

  mask(cfg?: ComponentConfig): Mask {
    return this.create(Mask, cfg);
  }

  private create<T extends Component, Cfg>(Ctor: new (scene: Scene, cfg: Cfg) => T, cfg: Cfg): T {
    const instance = new Ctor(this.scene, cfg);
    this._container.attach(instance, this.originX, this.originY);
    return instance;
  }
}
