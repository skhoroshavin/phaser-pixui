import { Component } from "../primitives/component";
import { Text, type TextConfig } from "../primitives/text";
import { resolveStateConfig, Stateful, StatesConfig } from "./base.ts";

export type TextStateConfig = {
  color?: number;
  offsetX?: number;
  offsetY?: number;
};

export type StatefulTextConfig = TextConfig & {
  states: StatesConfig<TextStateConfig>;
};

export class StatefulText extends Text implements Stateful {
  constructor(parent: Component, cfg: StatefulTextConfig) {
    super(parent, cfg);
    this._defaultColor = cfg.color ?? 0xffffff;
    this._states = cfg.states;
  }

  setState(state: string, fallback?: string): void {
    const s = resolveStateConfig(this._states, state, fallback);
    this.setColor(s.color ?? this._defaultColor);
    this.setOffsetX(s.offsetX ?? 0);
    this.setOffsetY(s.offsetY ?? 0);
  }

  private readonly _defaultColor: number;
  private readonly _states: StatesConfig<TextStateConfig>;
}
