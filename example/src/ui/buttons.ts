import { Component } from "../../../src/components/component";
import type { ClickableConfig } from "../../../src/components/clickable";
import { Button } from "../../../src/components/button";
import { MultiImage } from "../../../src/components/multi-image";
import { Text } from "../../../src/components/text";
import { colors, fonts, uiTexture } from "./constants.ts";

export type ButtonConfig = ClickableConfig & {
  text?: string;
};

export function button(parent: Component, cfg: ButtonConfig = {}): Button {
  const { text, ...rest } = cfg;
  const states = {
    normal: { frame: "button_up" },
    hover: { frame: "button_hover" },
    pressed: { frame: "button_down" },
    disabled: { frame: "button_disabled", tint: colors.disabled },
  };
  const btn = new Button(parent, { width: 128, ...states, ...rest });
  const frame = new MultiImage(btn, {
    texture: uiTexture,
    frames: Object.values(states).map((s) => s.frame),
    frame: states.normal.frame,
    inset: 0,
    tileX: true,
    tileY: true,
  });
  btn.node.setIntrinsicSize(frame.node.intrinsicSize());
  if (text !== undefined) new Text(btn, { font: fonts.roots, text, tint: colors.light });
  return btn;
}

export function settingsButton(parent: Component, cfg: ClickableConfig = {}): Button {
  const states = {
    normal: { frame: "button_settings_up" },
    hover: { frame: "button_settings_hover" },
    pressed: { frame: "button_settings_down" },
  };
  const btn = new Button(parent, { shape: "diamond", ...states, ...cfg });
  new MultiImage(btn, {
    texture: uiTexture,
    frames: Object.values(states).map((s) => s.frame),
    frame: states.normal.frame,
    inset: 0,
  });
  return btn;
}
