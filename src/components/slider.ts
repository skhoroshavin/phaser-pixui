import { Draggable } from "../behaviours/draggable";
import { Hoverable } from "../behaviours/hoverable";
import type { Mount } from "../mounts/mount";
import { Interactive, type InteractiveConfig } from "./interactive";
import { MultiImage } from "./multi-image";

export type SliderConfig = InteractiveConfig & {
  texture: string;
  trackFrame: string;
  trackHoverFrame?: string;
  trackDisabledFrame?: string;
  thumbFrame: string;
  thumbHoverFrame?: string;
  thumbPressedFrame?: string;
  thumbDisabledFrame?: string;
  value?: number;
  onChange?: (value: number) => void;
};

export class Slider extends Interactive {
  constructor(parent: Mount, cfg: SliderConfig) {
    super(parent, {
      ...cfg,
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "start",
    });

    this._value = cfg.value ?? 0;
    this._onChange = cfg.onChange;
    this._trackNormal = cfg.trackFrame;
    this._trackHover = cfg.trackHoverFrame;
    this._trackDisabled = cfg.trackDisabledFrame;
    this._thumbNormal = cfg.thumbFrame;
    this._thumbHover = cfg.thumbHoverFrame;
    this._thumbPressed = cfg.thumbPressedFrame;
    this._thumbDisabled = cfg.thumbDisabledFrame;

    this._drag = this.addBehaviour(
      new Draggable({
        axis: "x",
        onDragStart: (x) => {
          this._updateThumbFrame();
          this._dragThumb(x);
        },
        onDrag: (x) => this._dragThumb(x),
        onDragEnd: () => this._updateThumbFrame(),
      }),
    );
    this._hover = this.addBehaviour(
      new Hoverable({
        onUpdate: () => {
          this._updateThumbFrame();
          this._updateTrackFrame();
        },
      }),
    );

    const trackFrames = [cfg.trackFrame];
    if (cfg.trackHoverFrame) trackFrames.push(cfg.trackHoverFrame);
    if (cfg.trackDisabledFrame) trackFrames.push(cfg.trackDisabledFrame);

    const track = this.add(MultiImage, {
      texture: cfg.texture,
      frame: cfg.trackFrame,
      frames: trackFrames,
      inset: 0,
      marginY: "auto",
    });
    this._track = track;
    this.node.setIntrinsicSize(track.node.intrinsicSize());

    const thumbFrames = [cfg.thumbFrame];
    if (cfg.thumbHoverFrame) thumbFrames.push(cfg.thumbHoverFrame);
    if (cfg.thumbPressedFrame) thumbFrames.push(cfg.thumbPressedFrame);
    if (cfg.thumbDisabledFrame) thumbFrames.push(cfg.thumbDisabledFrame);

    this._thumb = this.add(MultiImage, {
      texture: cfg.texture,
      frame: cfg.thumbFrame,
      frames: thumbFrames,
    });

    const thumbOrigLayout = this._thumb.node.onLayout;
    this._thumb.node.onLayout = (rect, depth) => {
      thumbOrigLayout?.(rect, depth);
      const tw = this._thumb.node.rect.width;
      const cw = this.node.xAxis.contentSize(this.node.rect.width);
      this._thumbHalf = tw / 2;
      this._thumbTravel = Math.max(0, cw - tw);
      this._thumb.setOffsetX(Math.floor(this._value * this._thumbTravel));
    };

    this._updateThumbFrame();
    this._updateTrackFrame();
  }

  get value(): number {
    return this._value;
  }
  set value(v: number) {
    v = Math.max(0, Math.min(1, v));
    if (this._value === v) return;
    this._value = v;
    this._thumb.setOffsetX(Math.floor(this._value * this._thumbTravel));
  }

  protected onEnabledChange(): void {
    this._updateThumbFrame();
    this._updateTrackFrame();
  }

  protected onVisibilityChange(v: boolean): void {
    super.onVisibilityChange(v);
    if (v) {
      this._updateThumbFrame();
      this._updateTrackFrame();
    }
  }

  private _dragThumb(localX: number): void {
    const cx = Math.round(localX) - this.node.xAxis.paddingStart;
    const prev = this._value;
    this.value = (cx - this._thumbHalf) / Math.max(1, this._thumbTravel);
    if (this._value !== prev) this._onChange?.(this._value);
  }

  private _updateThumbFrame(): void {
    let frame: string;
    if (!this.enabled) frame = this._thumbDisabled ?? this._thumbNormal;
    else if (this._drag.dragging)
      frame = this._thumbPressed ?? this._thumbHover ?? this._thumbNormal;
    else if (this._hover.hovered) frame = this._thumbHover ?? this._thumbNormal;
    else frame = this._thumbNormal;
    this._thumb.setFrame(frame);
  }

  private _updateTrackFrame(): void {
    let frame: string;
    if (!this.enabled) frame = this._trackDisabled ?? this._trackNormal;
    else if (this._hover.hovered || this._drag.dragging)
      frame = this._trackHover ?? this._trackNormal;
    else frame = this._trackNormal;
    this._track.setFrame(frame);
  }

  private _value: number;
  private readonly _onChange?: (value: number) => void;
  private _track: MultiImage;
  private _trackNormal: string;
  private _trackHover?: string;
  private _trackDisabled?: string;
  private _thumb: MultiImage;
  private _thumbNormal: string;
  private _thumbHover?: string;
  private _thumbPressed?: string;
  private _thumbDisabled?: string;
  private readonly _drag: Draggable;
  private readonly _hover: Hoverable;
  private _thumbHalf = 0;
  private _thumbTravel = 0;
}
