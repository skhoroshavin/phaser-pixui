import { CANVAS, HEADLESS, VERSION, WEBGL } from "phaser";
import { ConstraintMode, UiScene } from "../../src";
import { Component } from "../../src/core/component.ts";
import { GameWorld } from "./game.ts";
import { button, settingsButton } from "./ui/buttons.ts";
import { frame, text } from "./ui/visuals.ts";
import { log_panel } from "./ui/log_panel.ts";
import { load_dialog } from "./ui/load_dialog.ts";
import { colors, fonts, uiTexture } from "./ui/constants.ts";

export class Ui extends UiScene {
  constructor() {
    super({
      key: "ui",
      active: true,
      viewportConstraints: {
        mode: ConstraintMode.Minimum,
        height: 320,
      },
    });
  }

  preload() {
    this.load.setPath("packed_assets");
    this.load.atlas(uiTexture, uiTexture + ".png", uiTexture + ".atlas");
    for (const font of Object.values(fonts)) {
      this.load.bitmapFont(font, "fonts.png", font + ".bmfont");
    }
  }

  create() {
    super.create();
    this.scene.bringToTop("ui");
    const logger = log_panel(this.root, { bottom: 2, left: 2, right: 2, height: 84 });

    const game = this.scene.get<GameWorld>("game-world");
    this.scene.launch(game);

    const loadDialog = load_dialog(this.root, (msg) => logger.write(msg));

    text(this.root, {
      right: 4,
      bottom: 88,
      font: fonts.branches,
      tint: colors.dark,
      text: `Phaser PixUI v${PHASER_PIXUI_VERSION}`,
    });

    const headerFrame = frame(this.root, {
      frame: "header_scroll",
      top: 64,
      width: 224,
      height: 32,
      left: 0,
      right: 0,
      marginX: "auto",
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
    });
    text(headerFrame, {
      font: fonts.trunk,
      tint: colors.dark,
      align: "center",
      text: "Phaser-PixUI demo",
    });

    const mainMenu = new Component(this.root, {
      inset: 0,
      direction: "column",
      gap: 2,
      justifyContent: "center",
      alignItems: "center",
    });

    button(mainMenu, {
      text: "New game",
      onClick: () => logger.write("New game is already started!"),
    });
    button(mainMenu, {
      text: "Load game",
      onClick: () => (loadDialog.visible = true),
    });
    button(mainMenu, {
      text: "Exit",
      enabled: false,
      onClick: () => logger.write("There is no escape :)"),
    });

    settingsButton(this.root, {
      right: 4,
      top: 4,
      width: 32,
      height: 32,
      onClick: () => logger.write("What do you want to customize here?"),
    });

    const dps = window.devicePixelRatio || 1;
    let rendererType;
    switch (this.renderer.type) {
      case CANVAS:
        rendererType = "Canvas";
        break;
      case WEBGL:
        rendererType = "WebGL";
        break;
      case HEADLESS:
        rendererType = "Headless";
        break;
      default:
        rendererType = "Unknown";
    }
    logger.write(`Phaser ${VERSION}, renderer ${rendererType}, device pixel ratio ${dps}`);

    this.scale.on("resize", () => {
      const dpr = window.devicePixelRatio || 1;
      const game = this.scene.get<GameWorld>("game-world");
      logger.write(
        `Canvas ${window.innerWidth * dpr}x${window.innerHeight * dpr}, UI ${this.viewport.width}x${this.viewport.height}, game ${game.viewport.width}x${game.viewport.height}`,
      );
    });
  }
}
