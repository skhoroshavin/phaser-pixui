import { defineTheme } from "../../src/theme";
import { builtinComponents } from "../../src/styled/theme";

export const uiTheme = defineTheme([...builtinComponents], {
  resources: {
    basePath: "packed_assets",
    atlas: "mana_soul",
    fonts: {
      atlas: "fonts",
      names: ["mana_roots", "mana_trunk", "mana_branches"],
    },
  },
  palette: {
    default: 0xfbe4af,
    light: 0xfbe4af,
    dark: 0x111343,
    disabled: 0x7bb6bc,
  },
  text: {
    font: "mana_roots",
    tint: "light",
    align: "left",
    styles: {
      header_scroll: {
        font: "mana_trunk",
        tint: "dark",
        align: "center",
      },
    },
  },
  frame: {
    frame: "frame_light",
    tileX: true,
    tileY: true,
    paddingX: 12,
    paddingY: 14,
    styles: {
      header_scroll: {
        frame: "header_scroll",
        padding: 0,
      },
    },
  },
  button: {
    textStyle: "default",
    normal: { frame: "button_up", tileX: true, tileY: true },
    hover: { frame: "button_hover", tileX: true, tileY: true },
    pressed: { frame: "button_down", tileX: true, tileY: true },
    disabled: { frame: "button_disabled", tileX: true, tileY: true, textTint: "disabled" },
    styles: {
      settings: {
        normal: { frame: "button_settings_up" },
        pressed: { frame: "button_settings_down" },
        hover: { frame: "button_settings_hover" },
        shape: "diamond",
      },
    },
  },
});
