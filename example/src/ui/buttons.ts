import { Component } from "../../../src/components/component";
import type { ClickableConfig } from "../../../src/components/clickable";
import { Button } from "../../../src/components/button";
import { Text } from "../../../src/components/text";
import { colors, fonts, uiTexture } from "./constants.ts";

export function button(parent: Component, text: string, cfg?: ClickableConfig): Button {
  const btn = parent.add(Button, {
    width: 96,
    paddingX: 5,
    paddingY: 5,
    normal: { frame: "button_up" },
    hover: { frame: "button_hover" },
    pressed: { frame: "button_down", offsetY: 1 },
    disabled: { frame: "button_disabled", tint: colors.disabled, offsetY: 1 },
    ...cfg,
  });
  const frame = btn.addImage({ texture: uiTexture, inset: 0, tileX: true, tileY: true });
  btn.node.setIntrinsicSize(frame.node.intrinsicSize());
  btn.add(Text, { font: fonts.pypx, text, tint: colors.dark });
  return btn;
}
