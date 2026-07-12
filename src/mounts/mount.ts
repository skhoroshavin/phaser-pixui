import { type Game, type Scene } from "phaser";
import { Component, type DisplayHost } from "../primitives/component";

export abstract class Mount extends Component {
  protected constructor(scene: Scene) {
    super();
    this._game = scene.game;
    this._game.events.on("prerender", this._flush);
    scene.events.once("shutdown", this.destroy, this);
  }

  abstract get displayHost(): DisplayHost;

  resolveLayout(): void {
    this._dirty = true;
  }

  protected abstract doResolve(): void;

  protected onDestroy(): void {
    this._game.events.off("prerender", this._flush);
  }

  private _flush = (): void => {
    // Loop guards against an onLayout callback re-arming the flag mid-resolve.
    while (this._dirty) {
      this._dirty = false;
      this.doResolve();
    }
  };

  private readonly _game: Game;
  private _dirty = false;
}
