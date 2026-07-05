import { TintModes } from "phaser";
import type { Component, ComponentConfig } from "./component";
import { MultiImage } from "./multi-image";
import { Text } from "./text";

export type StateVisualConfig = {
  frame: string;
  textTint?: number;
  textOffsetX?: number;
  textOffsetY?: number;
};

export type StateViewConfig = ComponentConfig & {
  texture: string;
  states: Record<string, StateVisualConfig | undefined>;
  fallback: string | ((state: string) => string);
  tileX?: boolean;
  tileY?: boolean;
  text?: string;
  font?: string;
  textTint?: number;
};

export class StateView extends MultiImage {
  constructor(parent: Component, cfg: StateViewConfig) {
    const states = Object.entries(cfg.states).filter(
      (e): e is [string, StateVisualConfig] => e[1] !== undefined,
    );

    super(parent, {
      frame: states[0]![1].frame,
      frames: states.map(([, v]) => v.frame),
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
      ...cfg,
    });

    this._states = Object.fromEntries(states);
    this._fallback = cfg.fallback;

    if (cfg.text !== undefined) {
      this._text = new Text(this, { font: cfg.font!, text: cfg.text, tint: cfg.textTint });
    }

    this.setState();
  }

  setState(s?: string) {
    const active = this._states[this._validState(s)]!;
    this.setFrame(active.frame);
    if (!this._text) return;
    this._text.setRenderOffset(active.textOffsetX ?? 0, active.textOffsetY ?? 0);
    if (active.textTint !== undefined) {
      this._text.internal.setTint(active.textTint).setTintMode(TintModes.FILL);
    }
  }

  private _validState(s?: string): string {
    const state = s ?? "default";
    if (state in this._states) return state;
    if (typeof this._fallback !== "function") return this._fallback;
    return this._fallback(state);
  }

  private readonly _fallback: string | ((state: string) => string);
  private readonly _states: Record<string, StateVisualConfig>;
  private readonly _text?: Text;
}
