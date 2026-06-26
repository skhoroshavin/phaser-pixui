import { Component, type ComponentConfig } from "../core2/component";
import { Frame, type FrameStyle } from "./frame";
import { Text } from "./text";
import { type ResolvedStyle, type StyleResolver, type ThemeColor } from "../theme2";
import type { ClickableState } from "../core2/clickable";

export type ControlFrameConfig = ComponentConfig & {
  style: ResolvedStyle<ControlFrameStyle, typeof ControlFrameStyleResolver>;
  text?: string;
};

export type StateStyle = FrameStyle & {
  textTint?: ThemeColor;
};

export type ControlFrameStyle = {
  textStyle?: string;
  normal: StateStyle;
  hover?: StateStyle;
  pressed?: StateStyle;
  disabled?: StateStyle;
};

export const ControlFrameStyleResolver = {
  textStyle: (_ctx, raw) => raw ?? "default",
  normal: (_ctx, raw) => resolveState(raw),
  hover: (_ctx, raw) => resolveState(raw),
  pressed: (_ctx, raw) => resolveState(raw),
  disabled: (_ctx, raw) => resolveState(raw),
} satisfies StyleResolver<ControlFrameStyle>;

function resolveState(raw: StateStyle | undefined) {
  const src = raw ?? ({} as StateStyle);
  return {
    frame: src.frame ?? "",
    tileX: src.tileX ?? false,
    tileY: src.tileY ?? false,
    textTint: src.textTint,
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
      const theme = this.mount.theme;
      this._text = new Text(this, {
        text: cfg.text,
        style: cfg.style.textStyle,
        margin: "auto",
      });
      const baseTint = theme.resolve(Text, cfg.style.textStyle).tint;
      for (const s of ["normal", "hover", "pressed", "disabled"] as const) {
        const override = cfg.style[s]?.textTint;
        this._textTints[s] = override !== undefined ? theme.palette.resolve(override) : baseTint;
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
