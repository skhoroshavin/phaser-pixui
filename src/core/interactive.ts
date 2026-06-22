import type { Events, GameObjects } from "phaser";
import { Geom, Scene } from "phaser";
import { Component, ComponentConfig } from "./component.ts";

type Rectangle = Geom.Rectangle;
type Ellipse = Geom.Ellipse;
type Container = GameObjects.Container;
type EventEmitter = Events.EventEmitter;
type Polygon = Geom.Polygon;

const { Rectangle, Ellipse, Polygon } = Geom;

export type InteractiveConfig = {
  draggable?: boolean;
  shape?: Shape;
} & ComponentConfig;

export type Shape = "rect" | "diamond" | "ellipse";

export class Interactive extends Component {
  constructor(scene: Scene, cfg?: InteractiveConfig) {
    super(scene, cfg);

    this._draggable = cfg?.draggable ?? false;

    switch (cfg?.shape ?? "rect") {
      case "rect":
        this._hitRect = new Rectangle();
        break;
      case "diamond":
        this._hitDiamond = new Polygon();
        break;
      case "ellipse":
        this._hitEllipse = new Ellipse();
        break;
    }

    this._hitArea = scene.make.container({});
  }

  get events(): EventEmitter {
    return this._hitArea;
  }
  private readonly _draggable: boolean;
  private readonly _hitArea: Container;

  get isDesktop() {
    return this.scene.sys.game.device.os.desktop;
  }

  override bringToTop() {
    this.scene.children.bringToTop(this._hitArea);
  }

  protected override updateVisible(visible: boolean) {
    if (!visible) {
      this._hitArea.disableInteractive();
      return;
    }

    if (this._interactiveSetUp) {
      this._hitArea.setInteractive();
      return;
    }

    this._interactiveSetUp = true;
    const config = {
      draggable: this._draggable,
    };
    if (this._hitRect) {
      this._hitArea.setInteractive({
        hitArea: this._hitRect,
        hitAreaCallback: Rectangle.Contains,
        ...config,
      });
    }
    if (this._hitDiamond) {
      this._hitArea.setInteractive({
        hitArea: this._hitDiamond,
        hitAreaCallback: Polygon.Contains,
        ...config,
      });
    }
    if (this._hitEllipse) {
      this._hitArea.setInteractive({
        hitArea: this._hitEllipse,
        hitAreaCallback: Ellipse.Contains,
        ...config,
      });
    }
  }

  protected override updatePosition() {
    if (this._hitRect) {
      this._hitRect.setPosition(this.left, this.top);
      this._hitRect.setSize(this.width, this.height);
    }
    if (this._hitDiamond) {
      this._hitDiamond.setTo([
        this.x,
        this.top,
        this.right,
        this.y,
        this.x,
        this.bottom,
        this.left,
        this.y,
      ]);
    }
    if (this._hitEllipse) {
      this._hitEllipse.setPosition(this.x, this.y);
      this._hitEllipse.setSize(this.width, this.height);
    }
  }
  private _interactiveSetUp = false;
  private readonly _hitRect?: Rectangle;
  private readonly _hitDiamond?: Polygon;
  private readonly _hitEllipse?: Ellipse;
}
