import { TextAlign, ThemeConfig } from "../../src";

export const uiTheme: ThemeConfig = {
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

  fontName: "mana_roots",
  fontSize: 16,
  fontTint: "light",

  button: {
    frame: "button",
    defaultWidth: 128,
    fontTintDisabled: "disabled",
    tileX: true,
    tileY: true,

    styles: {
      settings: {
        frame: "button_settings",
        shape: "diamond",
      },
    },
  },

  progress: {
    frame: "progress_curly",
    bar: "bar_green",
    paddingX: 5,
    paddingY: 3,
  },

  textArea: {
    styles: {
      header_scroll: {
        fontName: "mana_trunk",
        fontTint: "dark",
        defaultAlign: TextAlign.Center,
      },
    },
  },

  frame: {
    frame: "frame_light",
    paddingX: 12,
    paddingY: 14,
    tileX: true,
    tileY: true,

    styles: {
      header_scroll: {
        frame: "header_scroll",
        paddingX: 30,
        paddingY: 8,
      },
    },
  },

  dialog: {
    frame: "frame_bright",
    paddingX: 16,
    paddingY: 16,
    tileX: true,
    tileY: true,
    backdropColor: 0x000000,
    backdropAlpha: 0.5,
  },
};
