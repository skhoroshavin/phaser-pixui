import type { Cameras, GameObjects, Scene } from "phaser";
import { type Rect, fits } from "../shared/rect";
import { resolve } from "../layout";
import { Mount } from "./mount";

/** A Phaser game object that can be tracked by a {@link GameObjectMount}. */
export type GameObjectTarget = GameObjects.GameObject &
  GameObjects.Components.Transform &
  GameObjects.Components.Origin &
  GameObjects.Components.Size;

/**
 * Mounts a component tree that follows a target game object, converting between
 * the target's and UI camera coordinates. The tree is anchored to the target's
 * screen-space bounding box, and hidden when the target is off-screen, or when
 * there is no target.
 */
export class GameObjectMount extends Mount {
  constructor(scene: Scene, target?: GameObjectTarget) {
    super(scene);
    this._scene = scene;
    this._host = scene.add.container(0, 0);
    this._host.setVisible(false);
    scene.game.events.on("poststep", this._update, this);
    this.target = target;
  }

  /** Currently tracked game object, `undefined` if detached. */
  get target(): GameObjectTarget | undefined {
    return this._target;
  }

  /**
   * Sets the tracked game object. The mount detaches automatically when
   * the target is destroyed.
   */
  set target(go: GameObjectTarget | undefined) {
    if (go === this._target) return;
    this._detach();
    if (!go) return;
    this._target = go;
    go.once("destroy", this._detach, this);
    this._host.setVisible(true);
    this._update();
  }

  get displayHost(): GameObjects.Container {
    return this._host;
  }

  protected doResolve(): void {
    if (this.node.children.length === 0) return;
    this._baseBox = resolve(this.node);
    this._currentBox = resolve(this.node, this._viewBounds());
    this._host.sort("depth");
  }

  protected onDestroy(): void {
    super.onDestroy();
    this._scene.game.events.off("poststep", this._update, this);
    this._detach();
    this._host.destroy(true);
  }

  private _detach(): void {
    const t = this._target;
    if (!t) return;
    this._target = undefined;
    t.off("destroy", this._detach, this);
    this._host.setVisible(false);
  }

  private _update(): void {
    if (!this._target) return;
    const t = this._target;
    const uiCam = this._scene.cameras.main;
    const box = rectFromCanvas(uiCam, rectToCanvas(t.scene.cameras.main, gameObjectRect(t)));
    this._host.setPosition(box.x, box.y);
    const view = cameraRect(uiCam);
    const onScreen =
      box.x < view.x + view.width &&
      box.x + box.width > view.x &&
      box.y < view.y + view.height &&
      box.y + box.height > view.y;
    this._host.setVisible(onScreen);
    if (!onScreen) {
      this._wasHidden = true;
      return;
    }

    this.node.layout.width = Math.round(box.width);
    this.node.layout.height = Math.round(box.height);
    if (!this._baseBox || this._wasHidden || this._flipWanted()) this.resolveLayout();
    this._wasHidden = false;
  }

  private _viewBounds(): Rect | undefined {
    if (!this._target) return undefined;
    const v = cameraRect(this._scene.cameras.main);
    return { x: v.x - this._host.x, y: v.y - this._host.y, width: v.width, height: v.height };
  }

  private _flipWanted(): boolean {
    if (!this._baseBox || !this._currentBox) return false;
    const v = this._viewBounds();
    if (!v) return false;
    const flipped = !sameRect(this._baseBox, this._currentBox);
    return (flipped && fits(this._baseBox, v)) || !fits(this._currentBox, v);
  }

  private readonly _scene: Scene;
  private readonly _host: GameObjects.Container;
  private _target?: GameObjectTarget;
  private _baseBox?: Rect;
  private _currentBox?: Rect;
  private _wasHidden = false;
}

function sameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function pointToCanvas(
  cam: Cameras.Scene2D.Camera,
  x: number,
  y: number,
): { cx: number; cy: number } {
  return {
    cx: (x - cam.scrollX) * cam.zoomX + cam.width * 0.5 * (1 - cam.zoomX),
    cy: (y - cam.scrollY) * cam.zoomY + cam.height * 0.5 * (1 - cam.zoomY),
  };
}

function pointFromCanvas(
  cam: Cameras.Scene2D.Camera,
  cx: number,
  cy: number,
): { x: number; y: number } {
  return {
    x: (cx - cam.width * 0.5 * (1 - cam.zoomX)) / cam.zoomX + cam.scrollX,
    y: (cy - cam.height * 0.5 * (1 - cam.zoomY)) / cam.zoomY + cam.scrollY,
  };
}

function rectToCanvas(cam: Cameras.Scene2D.Camera, r: Rect): Rect {
  const p = pointToCanvas(cam, r.x, r.y);
  return { x: p.cx, y: p.cy, width: r.width * cam.zoomX, height: r.height * cam.zoomY };
}

function rectFromCanvas(cam: Cameras.Scene2D.Camera, r: Rect): Rect {
  const p = pointFromCanvas(cam, r.x, r.y);
  return { x: p.x, y: p.y, width: r.width / cam.zoomX, height: r.height / cam.zoomY };
}

function cameraRect(cam: Cameras.Scene2D.Camera): Rect {
  return rectFromCanvas(cam, { x: 0, y: 0, width: cam.width, height: cam.height });
}

function gameObjectRect(t: GameObjectTarget): Rect {
  return {
    x: t.x - t.originX * t.displayWidth,
    y: t.y - t.originY * t.displayHeight,
    width: t.displayWidth,
    height: t.displayHeight,
  };
}
