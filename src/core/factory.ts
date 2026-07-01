import { Scene } from "phaser";
import { Origin, OriginX, OriginY } from "../util/origin.ts";
import { Component } from "./component.ts";
import { Container } from "./container.ts";
import { Image, ImageConfig } from "./image.ts";

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

  image(cfg: ImageConfig): Image {
    return this.create(Image, cfg);
  }

  private create<T extends Component, Cfg>(Ctor: new (scene: Scene, cfg: Cfg) => T, cfg: Cfg): T {
    const instance = new Ctor(this.scene, cfg);
    this._container.attach(instance, this.originX, this.originY);
    return instance;
  }
}
