import { CANVAS, HEADLESS, VERSION, WEBGL } from "phaser";
import { ConstraintMode, TextArea, UiScene } from "../../src";
import { BitmapText } from "../../src/core2/bitmap-text.ts";
import { Frame } from "../../src/styled2/frame.ts";
import { Text } from "../../src/styled2/text.ts";
import { Button } from "../../src/styled2/button.ts";
import { resolveColor } from "../../src";
import { GameWorld } from "./game.ts";
import { uiTheme, uiTheme2 } from "./theme.ts";
import { load_dialog } from "./ui/load_dialog.ts";

export class Ui extends UiScene {
  constructor() {
    super({
      key: "ui",
      active: true,
      viewportConstraints: {
        mode: ConstraintMode.Minimum,
        height: 320,
      },
      theme: uiTheme,
      theme2: uiTheme2,
    });
  }

  create() {
    super.create();
    this.scene.bringToTop("ui");
    const logFrame = this.insert.bottom.frame({
      y: 2,
      width: -4,
      height: 84,
    });
    this._logArea = logFrame.insert.scrollableTextArea({});

    const progress = this.insert.bottom.progress({
      y: 108,
      width: 240,
      height: 24,
      visible: false,
    });
    const game = this.scene.get<GameWorld>("game-world");
    game.events.on("start", () => {
      progress.value = 0;
      progress.visible = true;
      game.load.on("progress", (v: number) => {
        progress.value = v;
      });
      game.load.once("complete", () => {
        progress.visible = false;
      });
    });
    this.scene.launch(game);

    const loadDialog = load_dialog(this.insert);

    new BitmapText(this.root, {
      right: 4,
      bottom: 88,
      font: "mana_branches",
      tint: resolveColor("dark", this.theme.palette),
      text: `Phaser PixUI v${PHASER_PIXUI_VERSION}`,
    });

    const headerFrame = new Frame(this.root, {
      style: "header_scroll",
      top: 64,
      width: 224,
      height: 32,
      marginX: "auto",
    });
    new Text(headerFrame, {
      style: "header_scroll",
      text: "Phaser-PixUI demo",
      margin: "auto",
    });

    new Button(this.root, {
      text: "New game",
      width: 128,
      height: 22,
      marginX: "auto",
      top: 145,
      onClick: () => this.log("New game is already started!"),
    });
    new Button(this.root, {
      text: "Load game",
      width: 128,
      height: 22,
      marginX: "auto",
      top: 169,
      onClick: () => (loadDialog.visible = true),
    });
    new Button(this.root, {
      text: "Exit",
      width: 128,
      height: 22,
      marginX: "auto",
      top: 193,
      enabled: false,
      onClick: () => this.log("There is no escape :)"),
    });

    new Button(this.root, {
      style: "settings",
      right: 4,
      top: 4,
      width: 32,
      height: 32,
      onClick: () => this.log("What do you want to customize here?"),
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
    this.log(`Phaser ${VERSION}, renderer ${rendererType}, device pixel ratio ${dps}`);

    this.scale.on("resize", () => {
      const dpr = window.devicePixelRatio || 1;
      const game = this.scene.get<GameWorld>("game-world");
      this.log(
        `Canvas ${window.innerWidth * dpr}x${window.innerHeight * dpr}, UI ${this.viewport.width}x${this.viewport.height}, game ${game.viewport.width}x${game.viewport.height}`,
      );
    });
  }

  log(msg: string) {
    const text = this._logArea.text + msg + "\n";
    const lines = text.split("\n");
    if (lines.length > 200) {
      const trimmedLines = lines.slice(-200);
      this._logArea.text = trimmedLines.join("\n");
    } else {
      this._logArea.text = text;
    }
  }
  private _logArea!: TextArea;
}
