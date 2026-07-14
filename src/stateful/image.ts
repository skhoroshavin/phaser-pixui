import { frameDimensions } from "../shared/frame";
import { type Axis } from "../shared/axis";
import { Component } from "../primitives/component";
import { Image, type ImageConfig } from "../primitives/image";
import { resolveStateConfig, Stateful, StatesConfig } from "./base.ts";

export type ImageStateConfig = {
  frame?: string;
  offsetX?: number;
  offsetY?: number;
};

export type ImageValueMode = "scale" | "position";

export type ImageValueConfig = {
  mode?: ImageValueMode;
  axis?: Axis;
  minSize?: number;
  visibleMin?: number;
  visibleMax?: number;
};

export type StatefulImageConfig = ImageConfig & {
  states?: StatesConfig<ImageStateConfig>;
  valueBinding?: ImageValueConfig;
};

export class StatefulImage extends Image implements Stateful {
  constructor(parent: Component, cfg: StatefulImageConfig) {
    super(parent, cfg);
    this._defaultFrame = cfg.frame;
    this._states = cfg.states ?? {};
    const vb = cfg.valueBinding;
    this._valueMode = vb?.mode;
    this._axis = vb?.axis ?? "x";
    this._visibleMin = vb?.visibleMin;
    this._visibleMax = vb?.visibleMax;
    this._minSize = vb?.mode === "scale" ? vb.minSize : undefined;

    const scene = this.displayHost.scene!;
    const frameNames = Object.values(this._states).map((s) => s?.frame ?? cfg.frame);
    frameNames.push(cfg.frame);
    const frames = frameNames.map((f) => frameDimensions(scene.textures.getFrame(cfg.texture, f)));
    this.node.setIntrinsicSize(
      frames.reduce(
        (acc, d) => ({
          width: Math.max(acc.width, d.width),
          height: Math.max(acc.height, d.height),
        }),
        { width: 0, height: 0 },
      ),
    );

    if (this._valueMode !== undefined) {
      const prev = this.node.onLayout;
      this.node.onLayout = (rect, depth) => {
        prev?.(rect, depth);
        this._applyValue();
      };
    }

    this._applyVisibility();
  }

  setState(state: string | undefined, fallback?: string): void {
    const s = resolveStateConfig(this._states, state, fallback);
    this.internal.setFrame(s.frame ?? this._defaultFrame);
    this.setOffsetX(s.offsetX ?? 0);
    this.setOffsetY(s.offsetY ?? 0);
    this._applyValue();
  }

  setValue(value: number): void {
    this._value = value;
    this._applyValue();
    this._applyVisibility();
  }

  private _applyValue(): void {
    if (this._valueMode === undefined) return;
    const v = this._value;
    if (this._valueMode === "scale") {
      const min = this._minSize ?? 0;
      if (this._axis === "x") {
        const width = this.node.rect.width;
        this.setSizeX(min + Math.floor(v * (width - min)));
      } else {
        const height = this.node.rect.height;
        const target = min + Math.floor(v * (height - min));
        this.setSizeY(target);
        this.setOffsetY(height - target);
      }
    } else {
      const m = this.node.availableRect;
      const r = this.node.rect;
      if (this._axis === "x") {
        const travel = Math.max(0, m.width - r.width);
        this.setOffsetX(Math.floor(m.x + v * travel - r.x));
      } else {
        const travel = Math.max(0, m.height - r.height);
        this.setOffsetY(Math.floor(m.y + (1 - v) * travel - r.y));
      }
    }
  }

  private _applyVisibility(): void {
    if (this._visibleMin === undefined && this._visibleMax === undefined) return;
    const lo = this._visibleMin ?? -Infinity;
    const hi = this._visibleMax ?? Infinity;
    this.visible = lo <= this._value && this._value <= hi;
  }

  private readonly _defaultFrame: string;
  private readonly _states: StatesConfig<ImageStateConfig>;
  private readonly _valueMode?: ImageValueMode;
  private readonly _axis: Axis;
  private readonly _visibleMin?: number;
  private readonly _visibleMax?: number;
  private readonly _minSize?: number;
  private _value = 0;
}
