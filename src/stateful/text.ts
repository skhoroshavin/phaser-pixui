import { Component } from "../primitives/component";
import { Text, type TextConfig } from "../primitives/text";
import { resolveStateConfig, Stateful, StatesConfig } from "./base.ts";

/** State-specific {@link StatefulText} configuration. */
export type TextStateConfig = {
  /** Text color to use in this state. */
  color?: number;
  /** Horizontal position offset to use in this state. */
  offsetX?: number;
  /** Vertical position offset to use in this state. */
  offsetY?: number;
};

/** Value binding configuration of a {@link StatefulText}. */
export type TextValueConfig = {
  /** Value below which the text is hidden. */
  visibleMin?: number;
  /** Value above which the text is hidden. */
  visibleMax?: number;
};

/** {@link StatefulText} configuration. */
export type StatefulTextConfig = TextConfig & {
  /** State-specific configurations, keyed by state name. */
  states: StatesConfig<TextStateConfig>;
  /** Value binding configuration. */
  valueBinding?: TextValueConfig;
};

/**
 * A {@link Text} with state and value bindings. Used by widgets like buttons
 * and toggles to drive their visuals.
 */
export class StatefulText extends Text implements Stateful {
  constructor(parent: Component, cfg: StatefulTextConfig) {
    super(parent, cfg);
    this._defaultColor = cfg.color ?? 0xffffff;
    this._states = cfg.states;
    this._visibleMin = cfg.valueBinding?.visibleMin;
    this._visibleMax = cfg.valueBinding?.visibleMax;
    this._applyVisibility();
  }

  /** Applies the given state, changing the text color and position offset. */
  setState(state: string | undefined, fallback?: string): void {
    const s = resolveStateConfig(this._states, state, fallback);
    this.setColor(s.color ?? this._defaultColor);
    this.setOffsetX(s.offsetX ?? 0);
    this.setOffsetY(s.offsetY ?? 0);
  }

  /** Applies the given value, updating text visibility. */
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
