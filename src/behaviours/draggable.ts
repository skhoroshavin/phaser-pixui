import type { GameObjects, Input } from "phaser";
import { axisLock, type Axis } from "../shared/axis";
import { Behaviour } from "./behaviour";

/** {@link Draggable} configuration. */
export type DraggableConfig = {
  /** Drag axis. By default, draggable on both axes. */
  axis?: Axis;
  /** Called when a drag starts. */
  onDragStart?: (x: number, y: number) => void;
  /** Called on every drag movement. */
  onDrag?: (x: number, y: number) => void;
  /** Called when a drag ends. */
  onDragEnd?: () => void;
};

/**
 * A behaviour that enables dragging an {@link Interactive} zone. Drag callbacks
 * receive the pointer position relative to the zone.
 */
export class Draggable extends Behaviour {
  private _dragging = false;
  private readonly _axis?: Axis;
  private readonly _onDragStart?: (x: number, y: number) => void;
  private readonly _onDrag?: (x: number, y: number) => void;
  private readonly _onDragEnd?: () => void;

  constructor(cfg?: DraggableConfig) {
    super();
    this._axis = cfg?.axis;
    this._onDragStart = cfg?.onDragStart;
    this._onDrag = cfg?.onDrag;
    this._onDragEnd = cfg?.onDragEnd;
  }

  /** Whether the zone is currently being dragged. */
  get dragging(): boolean {
    return this._dragging;
  }

  attach(zone: GameObjects.Zone): void {
    this.zone = zone;
    zone.scene!.input.setDraggable(zone);
    zone.on("dragstart", this._onDragStartEvent, this);
    zone.on("drag", this._onDragEvent, this);
    zone.on("dragend", this._onDragEndEvent, this);
  }

  detach(): void {
    this.zone.scene!.input.setDraggable(this.zone, false);
    this.zone.off("dragstart", this._onDragStartEvent, this);
    this.zone.off("drag", this._onDragEvent, this);
    this.zone.off("dragend", this._onDragEndEvent, this);
  }

  protected onActiveChange(active: boolean): void {
    if (!active) this._dragging = false;
  }

  private _onDragStartEvent(pointer: Input.Pointer): void {
    if (!this.active) return;
    const pos = axisLock(this._axis, pointer.worldX - this.zone.x, pointer.worldY - this.zone.y);
    this._dragging = true;
    this._onDragStart?.(pos.x, pos.y);
  }

  private _onDragEvent(pointer: Input.Pointer): void {
    if (!this.active) return;
    const pos = axisLock(this._axis, pointer.worldX - this.zone.x, pointer.worldY - this.zone.y);
    this._onDrag?.(pos.x, pos.y);
  }

  private _onDragEndEvent(): void {
    if (!this.active) return;
    this._dragging = false;
    this._onDragEnd?.();
  }
}
