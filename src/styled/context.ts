import { Scene } from "phaser";
import { ThemeConfig } from "../theme/theme.ts";
import { OriginX, OriginY } from "../util/origin.ts";
import { StyledComponentFactory } from "./factory.ts";

export class InsertContext extends StyledComponentFactory {
  constructor(scene: Scene, theme: ThemeConfig) {
    super({
      scene,
      theme,
      originX: OriginX.Center,
      originY: OriginY.Center,
    });
  }

  private at(originX: OriginX, originY: OriginY): StyledComponentFactory {
    const key = `${originX}-${originY}`;
    let factory = this._factories[key];
    if (!factory) {
      factory = new StyledComponentFactory({
        scene: this.scene,
        theme: this.theme,
        originX,
        originY,
      });
      factory.setContainer(this._container);
      this._factories[key] = factory;
    }
    return factory;
  }
  private readonly _factories: { [key: string]: StyledComponentFactory } = {};

  get left(): StyledComponentFactory {
    return this.at(OriginX.Left, OriginY.Center);
  }

  get bottom(): StyledComponentFactory {
    return this.at(OriginX.Center, OriginY.Bottom);
  }
}
