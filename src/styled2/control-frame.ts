import { Component, type ComponentConfig } from "../core2/component";
import { Frame, type FrameStyle, type ResolvedFrameStyle } from "./frame";
import { Text } from "./text";
import { type ThemeColor, type ThemeContext } from "../theme2";
import type { ClickableState } from "../core2/clickable";

export type ControlFrameConfig = ComponentConfig & {
  style: ResolvedControlFrameStyle;
  text?: string;
};

export type ControlFrameStyle = {
  textStyle?: string;
  normal: StateStyle;
  hover?: StateStyle;
  pressed?: StateStyle;
  disabled?: StateStyle;
};

export type StateStyle = FrameStyle & {
  textTint?: ThemeColor;
};

export type ResolvedControlFrameStyle = {
  textStyle: string;
  normal: ResolvedStateStyle;
  hover: ResolvedStateStyle;
  pressed: ResolvedStateStyle;
  disabled: ResolvedStateStyle;
};

export type ResolvedStateStyle = ResolvedFrameStyle & {
  textTint?: number;
};

export class ControlFrame extends Component {
  static resolveStyle(
    ctx: ThemeContext,
    raw: Partial<ControlFrameStyle>,
    def: ControlFrameStyle,
  ): ResolvedControlFrameStyle {
    return {
      textStyle: raw.textStyle ?? def.textStyle ?? "default",
      normal: resolveState(ctx, raw.normal, def.normal),
      hover: resolveState(ctx, raw.hover, def.hover ?? def.normal),
      pressed: resolveState(ctx, raw.pressed, def.pressed ?? def.normal),
      disabled: resolveState(ctx, raw.disabled, def.disabled ?? def.normal),
    };
  }

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
      if (style.frame === cfg.style.normal.frame) continue;

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
        this._textTints[s] = cfg.style[s].textTint ?? baseTint;
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
  private readonly _textTints: Record<ClickableState, number> = {
    normal: 0,
    hover: 0,
    pressed: 0,
    disabled: 0,
  };
}

function resolveState(
  ctx: ThemeContext,
  raw: StateStyle | undefined,
  def: StateStyle,
): ResolvedStateStyle {
  const textTint = raw?.textTint ?? def.textTint;
  return {
    frame: raw?.frame ?? def.frame,
    tileX: raw?.tileX ?? def.tileX ?? false,
    tileY: raw?.tileY ?? def.tileY ?? false,
    textTint: textTint === undefined ? undefined : ctx.palette.resolve(textTint),
  };
}
