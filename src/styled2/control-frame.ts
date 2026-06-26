import { Component, type ComponentConfig } from "../core2/component";
import { Frame, type FrameStyle } from "./frame";
import { Text } from "./text";
import { type ResolvedStyle, type StyleResolver } from "../theme2";
import type { ClickableState } from "../core2/clickable";

export type ControlFrameConfig = ComponentConfig & {
  style: ResolvedStyle<ControlFrameStyle, typeof ControlFrameStyleResolver>;
  text?: string;
};

export type StateStyle = FrameStyle & {
  textStyle?: string;
};

export type ControlFrameStyle = {
  normal: StateStyle;
  hover?: StateStyle;
  pressed?: StateStyle;
  disabled?: StateStyle;
};

export const ControlFrameStyleResolver = {
  normal: (_ctx, raw, _def, self) => resolveState(raw, self, "normal"),
  hover: (_ctx, raw, _def, self) => resolveState(raw, self, "hover"),
  pressed: (_ctx, raw, _def, self) => resolveState(raw, self, "pressed"),
  disabled: (_ctx, raw, _def, self) => resolveState(raw, self, "disabled"),
} satisfies StyleResolver<ControlFrameStyle>;

function resolveState(
  raw: StateStyle | undefined,
  self: Partial<ControlFrameStyle>,
  key: keyof ControlFrameStyle,
) {
  const src = raw ?? self[key] ?? {};
  return {
    frame: src.frame ?? "",
    tileX: src.tileX ?? false,
    tileY: src.tileY ?? false,
    textStyle: src.textStyle ?? "default",
  };
}

export class ControlFrame extends Component {
  constructor(parent: Component, cfg: ControlFrameConfig) {
    super(parent, cfg);

    const normal = new Frame(this, { style: cfg.style.normal, inset: 0 });
    this._frames = [normal];
    this._stateFrames = {
      normal,
      hover: normal,
      pressed: normal,
      disabled: normal,
    };

    for (const state of ["hover", "pressed", "disabled"] as const) {
      const style = cfg.style[state];
      if (!style || style.frame === cfg.style.normal.frame) continue;

      this._stateFrames[state] = new Frame(this, { style, inset: 0 });
      this._frames.push(this._stateFrames[state]);
    }

    if (cfg.text) {
      this._text = new Text(this, {
        text: cfg.text,
        style: cfg.style.normal.textStyle,
        margin: "auto",
      });
      const theme = this.mount.theme;
      for (const s of ["normal", "hover", "pressed", "disabled"] as const) {
        const ss = cfg.style[s] ?? cfg.style.normal;
        this._textTints[s] = theme.resolve(Text, ss.textStyle).tint;
      }
    }

    this._update();
  }

  get state(): ClickableState {
    return this._state;
  }
  set state(s: ClickableState) {
    if (s === this._state) return;
    this._state = s;
    this._update();
  }

  private _update(): void {
    const active = this._stateFrames[this._state];
    for (const f of this._frames) {
      f.internal.setVisible(f === active);
    }
    if (this._text) {
      this._text.internal.setTint(this._textTints[this._state]);
    }
  }

  private _state: ClickableState = "normal";
  private readonly _frames: Frame[];
  private readonly _stateFrames: Record<ClickableState, Frame>;
  private _text?: Text;
  private readonly _textTints: Record<ClickableState, number> = {} as Record<
    ClickableState,
    number
  >;
}
