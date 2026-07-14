import { Component } from "../primitives/component";
import { Text, type TextConfig } from "../primitives/text";
import { resolveStateConfig, Stateful, StatesConfig } from "./base.ts";

export type TextStateConfig = {
  color?: number;
  offsetX?: number;
  offsetY?: number;
};

export type TextValueConfig = {
  visibleMin?: number;
  visibleMax?: number;
};

export type StatefulTextConfig = TextConfig & {
  states: StatesConfig<TextStateConfig>;
  valueBinding?: TextValueConfig;
};

export class StatefulText extends Text implements Stateful {
  constructor(parent: Component, cfg: StatefulTextConfig) {
    super(parent, cfg);
    this._defaultColor = cfg.color ?? 0xffffff;
    this._states = cfg.states;
    this._visibleMin = cfg.valueBinding?.visibleMin;
    this._visibleMax = cfg.valueBinding?.visibleMax;
    this._applyVisibility();
  }

  setState(state: string | undefined, fallback?: string): void {
    const s = resolveStateConfig(this._states, state, fallback);
    this.setColor(s.color ?? this._defaultColor);
    this.setOffsetX(s.offsetX ?? 0);
    this.setOffsetY(s.offsetY ?? 0);
  }

  setValue(value: number): void {
    this._value = value;
    this._applyVisibility();
  }

  private _applyVisibility(): void {
    if (this._visibleMin === undefined && this._visibleMax === undefined) return;
    const lo = this._visibleMin ?? -Infinity;
    const hi = this._visibleMax ?? Infinity;
    this.visible = lo <= this._value && this._value <= hi;
  }

  private readonly _defaultColor: number;
  private readonly _states: StatesConfig<TextStateConfig>;
  private readonly _visibleMin?: number;
  private readonly _visibleMax?: number;
  private _value = 0;
}
