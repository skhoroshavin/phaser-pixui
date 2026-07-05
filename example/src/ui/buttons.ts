import { Component } from "../../../src/components/component";
import { Button, type ButtonConfig } from "../../../src/components/button";
import { colors, fonts, uiTexture } from "./constants.ts";

export function button(parent: Component, cfg?: Partial<ButtonConfig>): Button {
  return new Button(parent, {
    texture: uiTexture,
    width: 128,
    normal: { frame: "button_up" },
    hover: { frame: "button_hover" },
    pressed: { frame: "button_down" },
    disabled: { frame: "button_disabled", textTint: colors.disabled },
    tileX: true,
    tileY: true,
    font: fonts.roots,
    textTint: colors.light,
    ...cfg,
  });
}

export function settingsButton(parent: Component, cfg?: Partial<ButtonConfig>): Button {
  return new Button(parent, {
    texture: uiTexture,
    normal: { frame: "button_settings_up" },
    hover: { frame: "button_settings_hover" },
    pressed: { frame: "button_settings_down" },
    shape: "diamond",
    ...cfg,
  });
}
