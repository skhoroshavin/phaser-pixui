import { Component } from "../../../src/components/component";
import type { ClickableConfig } from "../../../src/components/clickable";
import { Button } from "../../../src/components/button";
import { Text } from "../../../src/components/text";
import { colors, fonts, uiTexture } from "./constants.ts";

export function button(parent: Component, text: string, cfg?: ClickableConfig): Button {
  const btn = parent.add(Button, {
    width: 128,
    normal: { frame: "button_up" },
    hover: { frame: "button_hover" },
    pressed: { frame: "button_down" },
    disabled: { frame: "button_disabled", tint: colors.disabled },
    ...cfg,
  });
  const frame = btn.addImage({ texture: uiTexture, inset: 0, tileX: true, tileY: true });
  btn.node.setIntrinsicSize(frame.node.intrinsicSize());
  btn.add(Text, { font: fonts.roots, text, tint: colors.light });
  return btn;
}

export function settingsButton(parent: Component, cfg: ClickableConfig = {}): Button {
  const btn = parent.add(Button, {
    shape: "diamond",
    normal: { frame: "button_settings_up" },
    hover: { frame: "button_settings_hover" },
    pressed: { frame: "button_settings_down" },
    ...cfg,
  });
  btn.addImage({ texture: uiTexture, inset: 0 });
  return btn;
}
