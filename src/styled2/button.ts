import { StyleRegistry, type Variants, inherit, value } from "./theme-utils.js";
import type { ControlFrameStyle } from "./control-frame.js";
import type { HitShape } from "../core2/interactive.js";

export type ButtonStyle = ControlFrameStyle & {
  shape?: HitShape;
};

export type ResolvedButtonStyle = ControlFrameStyle & {
  shape: HitShape;
};

export type ButtonThemeConfig = Variants<ButtonStyle>;

export class ButtonTheme extends StyleRegistry<ResolvedButtonStyle> {
  static readonly key = "button";

  constructor(cfg: ButtonThemeConfig) {
    super(cfg, {
      normal: inherit(),
      hover: (raw, def, self) => raw ?? self.normal ?? def,
      pressed: (raw, def, self) => raw ?? self.normal ?? def,
      disabled: (raw, def, self) => raw ?? self.normal ?? def,
      shape: value("rect"),
    });
  }
}
