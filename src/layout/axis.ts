export class Axis {
  constructor(
    readonly start: number | undefined,
    readonly end: number | undefined,
    readonly marginStart: number,
    readonly marginEnd: number,
    readonly marginStartAuto: boolean,
    readonly marginEndAuto: boolean,
    readonly marginAuto = marginStartAuto && marginEndAuto,
    private readonly _start = start ?? 0,
    private readonly _end = end ?? 0,
  ) {}

  /** Space required to hold a content of `size` on this axis */
  extent(size: number): number {
    return this._start + this.marginStart + size + this.marginEnd + this._end;
  }

  /** Child size when stretched to fill `parentSize` on this axis. */
  stretch(parentSize: number): number {
    return Math.max(0, parentSize - this._start - this._end - this.marginStart - this.marginEnd);
  }

  /** Whether either edge on this axis is set. */
  get hasEdge(): boolean {
    return this.start !== undefined || this.end !== undefined;
  }

  /** Whether both edges on this axis are set. */
  get hasBothEdges(): boolean {
    return this.start !== undefined && this.end !== undefined;
  }
}
