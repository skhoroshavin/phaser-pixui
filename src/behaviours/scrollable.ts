import type { GameObjects, Input } from "phaser";
import { axisLock, type Axis } from "../shared/axis";
import { Behaviour } from "./behaviour";

export type ScrollableConfig = {
  axis?: Axis;
  onScroll?: (dx: number, dy: number) => void;
};

export class Scrollable extends Behaviour {
  private readonly _axis?: Axis;
  private readonly _onScroll?: (dx: number, dy: number) => void;
  private _lastPos: vec2 = ZERO;
  private _velocity: vec2 = ZERO;
  private _timestamp = 0;

  constructor(cfg: ScrollableConfig) {
    super();
    this._axis = cfg.axis;
    this._onScroll = cfg.onScroll;
  }

  attach(zone: GameObjects.Zone): void {
    this.zone = zone;
    zone.scene!.input.setDraggable(zone);
    zone.on("dragstart", this._onDragStart, this);
    zone.on("drag", this._onDrag, this);
    zone.on("dragend", this._onDragEnd, this);
    zone.on("wheel", this._onWheel, this);
  }

  detach(): void {
    this._stopCoast();
    this.zone.scene!.input.setDraggable(this.zone, false);
    this.zone.off("dragstart", this._onDragStart, this);
    this.zone.off("drag", this._onDrag, this);
    this.zone.off("dragend", this._onDragEnd, this);
    this.zone.off("wheel", this._onWheel, this);
  }

  protected onActiveChange(active: boolean): void {
    if (!active) this._stopCoast();
  }

  private _onDragStart(pointer: Input.Pointer): void {
    if (!this.active) return;
    this._stopCoast();
    this._lastPos = axisLock(
      this._axis,
      pointer.worldX - this.zone.x,
      pointer.worldY - this.zone.y,
    );
    this._velocity = ZERO;
    this._timestamp = this.zone.scene!.time.now;
  }

  private _onDrag(pointer: Input.Pointer): void {
    if (!this.active) return;
    const pos = axisLock(this._axis, pointer.worldX - this.zone.x, pointer.worldY - this.zone.y);
    const delta: vec2 = { x: pos.x - this._lastPos.x, y: pos.y - this._lastPos.y };
    const now = this.zone.scene!.time.now;
    const dt = now - this._timestamp;
    const sample = scale(delta, 1 / (dt + 1));
    this._velocity = {
      x: sample.x * 0.8 + this._velocity.x * 0.2,
      y: sample.y * 0.8 + this._velocity.y * 0.2,
    };
    this._timestamp = now;
    this._lastPos = pos;
    const d = scale(delta, -1);
    this._onScroll?.(d.x, d.y);
  }

  private _onDragEnd(): void {
    if (!this.active) return;
    if (len(this._velocity) >= 0.002) {
      this.zone.scene!.events.on("update", this._coast, this);
    }
  }

  private _onWheel(_pointer: Input.Pointer, dx: number, dy: number): void {
    if (!this.active) return;
    this._stopCoast();
    const zoom = this.zone.scene!.cameras.main.zoom;
    const d = axisLock(this._axis, dx / zoom, dy / zoom);
    this._onScroll?.(d.x, d.y);
  }

  private _coast(_time: number, frameDelta: number): void {
    const d = scale(this._velocity, -frameDelta);
    this._onScroll?.(d.x, d.y);
    this._velocity = scale(this._velocity, 0.94);
    if (len(this._velocity) < 0.002) {
      this._stopCoast();
    }
  }

  private _stopCoast(): void {
    this._velocity = ZERO;
    this.zone?.scene?.events.off("update", this._coast, this);
  }
}

type vec2 = { x: number; y: number };
const ZERO: vec2 = { x: 0, y: 0 };
const scale = (v: vec2, s: number): vec2 => ({ x: v.x * s, y: v.y * s });
const len = (v: vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);
