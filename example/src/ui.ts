import { CANVAS, HEADLESS, VERSION, WEBGL } from "phaser";
import { ConstraintMode, ResponsiveScene, SceneMount } from "../../src";
import { Component } from "../../src/components/component.ts";
import { GameWorld } from "./game.ts";
import { button } from "./ui/controls.ts";
import { frame, text } from "./ui/visuals.ts";
import { log_panel } from "./ui/log_panel.ts";
import { load_dialog } from "./ui/load_dialog.ts";
import { settings_dialog } from "./ui/settings_dialog.ts";
import { colors, fonts, uiTexture } from "./ui/constants.ts";

export class Ui extends ResponsiveScene {
  constructor() {
    super({
      key: "ui",
      active: true,
      viewportConstraints: {
        mode: ConstraintMode.Minimum,
        height: 240,
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

    const mount = new SceneMount(this, {
      viewport: () => this.viewport,
    });
    const root = new Component(mount);

    const logger = log_panel(root, { bottom: 2, insetX: 2, height: 60 });

    const game = this.scene.get<GameWorld>("game-world");
    this.scene.launch(game);

    const loadDialog = root.add(load_dialog, (msg) => logger.write(msg));
    const settingsDialog = root.add(settings_dialog, (msg) => logger.write(msg));

    root.add(text, {
      right: 4,
      bottom: 64,
      font: fonts.alternative,
      tint: colors.dark,
      text: `Phaser PixUI v${PHASER_PIXUI_VERSION}`,
    });

    const headerFrame = root.add(frame, {
      frame: "frame-header",
      top: 32,
      insetX: 0,
      marginX: "auto",
      paddingX: 16,
      alignItems: "center",
    });
    headerFrame.add(text, {
      font: fonts.title,
      tint: colors.dark,
      align: "center",
      text: "Phaser-PixUI demo",
    });

    const mainMenu = root.add(Component, {
      inset: 0,
      direction: "column",
      gap: 4,
      justifyContent: "center",
      alignItems: "center",
    });

    mainMenu.add(button, "New game", {
      onClick: () => logger.write("New game is already started!"),
    });
    mainMenu.add(button, "Load game", {
      onClick: () => (loadDialog.visible = true),
    });
    mainMenu.add(button, "Settings", {
      onClick: () => (settingsDialog.visible = true),
    });
    mainMenu.add(button, "Exit", {
      enabled: false,
      onClick: () => logger.write("There is no escape :)"),
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
