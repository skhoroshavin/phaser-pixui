import { CANVAS, GameObjects, HEADLESS, VERSION, WEBGL } from "phaser";
import {
  Container,
  GameObjectMount,
  ResponsiveScene,
  SceneMount,
  PageStack,
} from "phaser-pixui";
import { GameWorld } from "./game.ts";
import { button, health_bar, tabgroup } from "./ui/controls.ts";
import { chat_bubble, frame, header, text } from "./ui/visuals.ts";
import { LogPanel } from "./ui/log_panel.ts";
import { load_dialog } from "./ui/load_dialog.ts";
import { settings_dialog } from "./ui/settings_dialog.ts";
import { colors, fonts, uiTexture } from "./ui/constants.ts";

const testMode = new URLSearchParams(window.location.search).has("test");

export class Ui extends ResponsiveScene {
  constructor() {
    super({
      key: "ui",
      active: true,
      viewportConstraints: {
        mode: "minimum",
        height: 240,
      },
    });
  }

  preload() {
    this.load.setPath("packed_assets");
    this.load.atlas(uiTexture, uiTexture + ".png", uiTexture + ".atlas");
    this.load.image("fonts", "fonts.png");
    for (const font of Object.values(fonts)) {
      this.load.xml(font, font + ".bmfont");
    }
  }

  create() {
    super.create();
    for (const font of Object.values(fonts)) {
      GameObjects.BitmapText.ParseFromAtlas(this, font, "fonts", "__BASE", font);
    }

    const game = this.scene.get<GameWorld>("game-world");
    this.scene.launch(game);
    this.scene.bringToTop("ui");

    const mount = new SceneMount(this, {
      viewport: () => this.viewport,
    });

    const bottomRow = mount.add(Container, {
      bottom: 2,
      insetX: 2,
      height: 60,
      direction: "row",
    });
    const healthBar = bottomRow.add(health_bar, { marginRight: 2 });
    const bottomFrame = bottomRow.add(frame, { grow: 1 });
    const stack = bottomFrame.add(PageStack, { grow: 1 });
    bottomRow.add(tabgroup, ["Log", "Inv"], { onChange: (v) => (stack.current = v) });

    const logger = stack.addPage(LogPanel, { inset: 0 });
    stack.addPage(text, { insetX: 0, text: "Inventory component is still under construction" });

    const loadDialog = mount.add(load_dialog, (msg) => logger.write(msg));
    const settingsDialog = mount.add(
      settings_dialog,
      (msg) => logger.write(msg),
      (v) => (healthBar.value = v),
    );

    mount.add(text, {
      right: 4,
      bottom: 64,
      font: fonts.alternative,
      color: colors.dark,
      text: `Phaser PixUI v${PHASER_PIXUI_VERSION}`,
    });

    mount.add(header, "Phaser-PixUI demo", { top: 32, insetX: 0 });

    game.events.once("create", () => {
      const phrases = ["Catch me if you can!", "Ha-ha!", ""];

      const npcMount = new GameObjectMount(this, game.npc);
      const { bubble, bubbleText } = npcMount.add(chat_bubble, phrases[0], {
        right: 32,
        bottom: 32,
      });

      if (testMode) return;

      this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
          const phrase = phrases[Math.floor(Math.random() * phrases.length)] ?? "";
          bubble.visible = phrase !== "";
          bubbleText.text = phrase;
        },
      });
    });

    const mainMenu = mount.add(Container, {
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
