import { type Game, type Scene } from "phaser";
import { Component, type DisplayHost } from "../primitives/component";

export abstract class Mount extends Component {
  protected constructor(scene: Scene) {
    super();
    this._game = scene.game;
    scene.events.once("shutdown", this.destroy, this);
  }

  abstract get displayHost(): DisplayHost;

  resolveLayout(): void {
    if (this._dirty) return;
    this._dirty = true;
    this._game.events.once("prerender", this._flush);
  }

  protected abstract doResolve(): void;

  protected onDestroy(): void {
    this._game.events.off("prerender", this._flush);
  }

  private _flush = (): void => {
    this._dirty = false;
    this.doResolve();
  };

  private readonly _game: Game;
  private _dirty = false;
}
