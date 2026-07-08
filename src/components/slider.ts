import type { Component } from "./component";
import { type ComponentConfig } from "./component";
import { Draggable } from "./draggable";
import { MultiImage } from "./multi-image";

export type SliderConfig = ComponentConfig & {
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

export class Slider extends Draggable {
  constructor(parent: Component, cfg: SliderConfig) {
    super(parent, {
      ...cfg,
      axis: "x",
      wheel: false,
      kinetic: false,
      justifyContent: cfg.justifyContent ?? "center",
      alignItems: cfg.alignItems ?? "start",
      onDragStart: (x) => {
        if (!this.enabled) return;
        this._dragging = true;
        this._applyThumbFrame();
        this._dragThumb(x);
      },
      onDrag: (x) => {
        if (this.enabled) this._dragThumb(x);
      },
      onDragEnd: () => {
        this._dragging = false;
        this._applyThumbFrame();
      },
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

    const zone = this.internal;
    const isDesktop = this.mount.displayHost.scene!.sys.game.device.os.desktop;
    zone.on("pointerover", () => {
      if (!this.enabled || !isDesktop) return;
      this._hovered = true;
      this._applyThumbFrame();
      this._applyTrackFrame();
    });
    zone.on("pointerout", () => {
      if (!this.enabled) return;
      this._hovered = false;
      this._applyThumbFrame();
      this._applyTrackFrame();
    });

    this._applyThumbFrame();
    this._applyTrackFrame();
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

  get enabled(): boolean {
    return super.enabled;
  }
  set enabled(v: boolean) {
    super.enabled = v;
    this._applyThumbFrame();
    this._applyTrackFrame();
  }

  private _dragThumb(localX: number): void {
    const cx = Math.round(localX) - this.node.xAxis.paddingStart;
    const prev = this._value;
    this.value = (cx - this._thumbHalf) / Math.max(1, this._thumbTravel);
    if (this._value !== prev) this._onChange?.(this._value);
  }

  private _applyThumbFrame(): void {
    let frame: string;
    if (!this.enabled) frame = this._thumbDisabled ?? this._thumbNormal;
    else if (this._dragging) frame = this._thumbPressed ?? this._thumbHover ?? this._thumbNormal;
    else if (this._hovered) frame = this._thumbHover ?? this._thumbNormal;
    else frame = this._thumbNormal;
    this._thumb.setFrame(frame);
  }

  private _applyTrackFrame(): void {
    let frame: string;
    if (!this.enabled) frame = this._trackDisabled ?? this._trackNormal;
    else if (this._hovered || this._dragging) frame = this._trackHover ?? this._trackNormal;
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
  private _hovered = false;
  private _dragging = false;
  private _thumbHalf = 0;
  private _thumbTravel = 0;
}
