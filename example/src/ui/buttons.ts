import { Component } from "../../../src/core/component";
import { Button, type ButtonConfig } from "../../../src/widgets/button";
import { colors, fonts, uiTexture } from "./constants.ts";

export function button(parent: Component, cfg?: Partial<ButtonConfig>): Button {
  return new Button(parent, {
    texture: uiTexture,
    width: 128,
    normal: { frame: "button_up", ...tiled },
    hover: { frame: "button_hover", ...tiled },
    pressed: { frame: "button_down", ...tiled },
    disabled: { frame: "button_disabled", ...tiled, textTint: colors.disabled },
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

const tiled = { tileX: true, tileY: true };
