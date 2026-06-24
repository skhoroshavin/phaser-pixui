import type { BoxConfig } from "../layout";
import { Component } from "../core2/component";
import { Frame, FrameStyleResolver, type FrameStyle, type ResolvedFrameStyle } from "./frame";
import type { ClickableState } from "../core2/clickable";
import { resolveStyle, type ResolvedStyle, type StyleResolver } from "../theme2";

export type ControlFrameConfig = BoxConfig & {
  style: ResolvedStyle<ControlFrameStyle, typeof ControlFrameStyleResolver>;
};

export type ControlFrameStyle = {
  normal: FrameStyle;
  hover?: FrameStyle;
  pressed?: FrameStyle;
  disabled?: FrameStyle;
};

export const ControlFrameStyleResolver = {
  normal: (ctx, raw, def, self) =>
    resolveStyle(ctx, raw ?? self.normal ?? {}, frameDefaults(def), FrameStyleResolver),
  hover: (ctx, raw, def, self) =>
    resolveStyle(ctx, raw ?? self.normal ?? {}, frameDefaults(def), FrameStyleResolver),
  pressed: (ctx, raw, def, self) =>
    resolveStyle(ctx, raw ?? self.normal ?? {}, frameDefaults(def), FrameStyleResolver),
  disabled: (ctx, raw, def, self) =>
    resolveStyle(ctx, raw ?? self.normal ?? {}, frameDefaults(def), FrameStyleResolver),
} satisfies StyleResolver<ControlFrameStyle>;

const frameDefaults = (s?: FrameStyle): ResolvedFrameStyle => ({
  frame: s?.frame ?? "",
  tileX: s?.tileX ?? false,
  tileY: s?.tileY ?? false,
});

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
  }

  private _state: ClickableState = "normal";
  private readonly _frames: Frame[];
  private readonly _stateFrames: Record<ClickableState, Frame>;
}
