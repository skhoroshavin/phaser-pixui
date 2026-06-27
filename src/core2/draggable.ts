import { Component } from "./component";
import { Interactive, type InteractiveConfig } from "./interactive";
import { add, len, scale, sub, type vec2 } from "../util/vec2";

export type DraggableConfig = InteractiveConfig & {
  axis?: Axis;
  wheel?: boolean;
  kinetic?: boolean;
  onDragStart?: (origin: vec2) => void;
  onDrag?: (pos: vec2) => void;
  onDragEnd?: () => void;
  onScroll?: (delta: vec2) => void;
};

type Axis = "x" | "y" | "both";

const ZERO: vec2 = { x: 0, y: 0 };

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
      this._onDragStart?.(origin);
    });

    zone.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const pos = this._axisLock(dragX, dragY);
      const delta = sub(pos, this._lastPos);

      const now = Date.now();
      const dt = now - this._timestamp;
      const sample = scale(delta, 1 / (dt + 1));
      this._velocity = add(scale(sample, 0.8), scale(this._velocity, 0.2));
      this._timestamp = now;

      this._lastPos = pos;
      this._onDrag?.(pos);
      this._onScroll?.(delta);
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
        this._onScroll?.(this._axisLock(dx / zoom, dy / zoom));
      });
    }
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (!v) this._stopCoast();
  }

  private _coast(_time: number, frameDelta: number): void {
    this._onScroll?.(scale(this._velocity, frameDelta));
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
  private readonly _onDragStart?: (origin: vec2) => void;
  private readonly _onDrag?: (pos: vec2) => void;
  private readonly _onDragEnd?: () => void;
  private readonly _onScroll?: (delta: vec2) => void;

  private _lastPos: vec2 = ZERO;
  private _velocity: vec2 = ZERO;
  private _timestamp = 0;
}
