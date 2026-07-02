import { Component } from "./component";
import { Interactive, type InteractiveConfig } from "./interactive";

export type DraggableConfig = InteractiveConfig & {
  axis?: Axis;
  wheel?: boolean;
  kinetic?: boolean;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  onScroll?: (dx: number, dy: number) => void;
};

type Axis = "x" | "y" | "both";

type vec2 = { x: number; y: number };
const ZERO: vec2 = { x: 0, y: 0 };
const scale = (v: vec2, s: number): vec2 => ({ x: v.x * s, y: v.y * s });
const len = (v: vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);

export class Draggable extends Interactive {
  constructor(parent: Component, cfg: DraggableConfig = {}) {
    super(parent, cfg);

    this._axis = cfg.axis ?? "both";
    this._kinetic = cfg.kinetic ?? false;
    this._wheel = cfg.wheel ?? true;
    this._onDragStart = cfg.onDragStart;
    this._onDrag = cfg.onDrag;
    this._onDragEnd = cfg.onDragEnd;
    this._onScroll = cfg.onScroll;

    const zone = this.internal;
    const scene = this.mount.displayHost.scene!;
    scene.input.setDraggable(zone);

    zone.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      this._stopCoast();
      const origin = this._axisLock(pointer.worldX - zone.x, pointer.worldY - zone.y);
      this._lastPos = origin;
      this._velocity = ZERO;
      this._timestamp = Date.now();
      this._onDragStart?.(origin.x, origin.y);
    });

    zone.on("drag", (pointer: Phaser.Input.Pointer) => {
      const pos = this._axisLock(pointer.worldX - zone.x, pointer.worldY - zone.y);
      const delta: vec2 = { x: pos.x - this._lastPos.x, y: pos.y - this._lastPos.y };

      const now = Date.now();
      const dt = now - this._timestamp;
      const sample = scale(delta, 1 / (dt + 1));
      this._velocity = {
        x: sample.x * 0.8 + this._velocity.x * 0.2,
        y: sample.y * 0.8 + this._velocity.y * 0.2,
      };
      this._timestamp = now;

      this._lastPos = pos;
      this._onDrag?.(pos.x, pos.y);
      const d = scale(delta, -1);
      this._onScroll?.(d.x, d.y);
    });

    zone.on("dragend", () => {
      this._onDragEnd?.();
      if (this._kinetic && len(this._velocity) >= 0.002) {
        scene.events.on("update", this._coast, this);
      }
    });

    if (this._wheel) {
      zone.on("wheel", (_pointer: Phaser.Input.Pointer, dx: number, dy: number) => {
        this._stopCoast();
        const zoom = scene.cameras.main.zoom;
        const d = this._axisLock(dx / zoom, dy / zoom);
        this._onScroll?.(d.x, d.y);
      });
    }
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (!v) this._stopCoast();
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
    this.mount.displayHost.scene?.events.off("update", this._coast, this);
  }

  private _axisLock(x: number, y: number): vec2 {
    switch (this._axis) {
      case "x":
        return { x, y: 0 };
      case "y":
        return { x: 0, y };
      default:
        return { x, y };
    }
  }

  private readonly _axis: Axis;
  private readonly _kinetic: boolean;
  private readonly _wheel: boolean;
  private readonly _onDragStart?: (x: number, y: number) => void;
  private readonly _onDrag?: (x: number, y: number) => void;
  private readonly _onDragEnd?: () => void;
  private readonly _onScroll?: (dx: number, dy: number) => void;

  private _lastPos: vec2 = ZERO;
  private _velocity: vec2 = ZERO;
  private _timestamp = 0;
}
