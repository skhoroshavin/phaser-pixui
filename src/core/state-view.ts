import { TintModes } from "phaser";
import { Component, type ComponentConfig } from "./component";
import { Image } from "./image";
import { Text } from "./text";

export type StateVisualConfig = {
  frame: string;
  tileX?: boolean;
  tileY?: boolean;
  textTint?: number;
};

export type StateViewConfig = ComponentConfig & {
  states: Record<string, StateVisualConfig | undefined>;
  fallback: string | ((state: string) => string);
  text?: string;
  font?: string;
  textTint?: number;
};

export class StateView extends Component {
  constructor(parent: Component, cfg: StateViewConfig) {
    super(parent, {
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
      ...cfg,
    });

    this._fallback = cfg.fallback;
    const atlas = this.mount.atlas;

    for (const [state, v] of Object.entries(cfg.states)) {
      if (!v) continue;
      this._states[state] = {
        image: new Image(this, {
          texture: atlas,
          frame: v.frame,
          tileX: v.tileX,
          tileY: v.tileY,
          inset: 0,
          visible: false,
        }),
        textTint: v.textTint ?? cfg.textTint,
      };
    }

    if (cfg.text !== undefined) {
      this._text = new Text(this, {
        font: cfg.font!,
        text: cfg.text,
        tint: cfg.textTint,
      });
    }

    this.setState();
  }

  setState(s?: string) {
    const active = this._states[this._validState(s)]!;
    for (const state of Object.values(this._states)) {
      state.image.visible = state === active;
    }
    if (this._text && active.textTint !== undefined) {
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
  private readonly _states: Record<string, State> = {};
  private readonly _text?: Text;
}

type State = { image: Image; textTint?: number };
