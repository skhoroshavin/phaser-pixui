import { CANVAS, HEADLESS, VERSION, WEBGL } from "phaser";
import { ConstraintMode, TextArea, UiScene } from "phaser-pixui";
import { resolveColor } from "../../src";
import { GameWorld } from "./game.ts";
import { uiTheme } from "./theme.ts";
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

    this.insert.bottomRight.bitmapText({
      x: 4,
      y: 88,
      font: "mana_branches",
      tint: resolveColor("dark", this.theme.palette),
      text: `Phaser PixUI v${PHASER_PIXUI_VERSION}`,
    });

    const headerFrame = this.insert.top.frame({
      style: "header_scroll",
      y: 64,
      width: 224,
      height: 32,
    });
    headerFrame.insert.textArea({
      style: "header_scroll",
      text: "Phaser-PixUI demo",
    });

    this.insert.center.button({
      y: -24,
      text: "New game",
      onClick: () => this.log("New game is already started!"),
    });
    this.insert.center.button({
      text: "Load game",
      onClick: () => (loadDialog.visible = true),
    });
    this.insert.center.button({
      y: 24,
      text: "Exit",
      enabled: false,
      onClick: () => this.log("There is no escape :)"),
    });

    this.insert.topRight.button({
      style: "settings",
      x: 4,
      y: 4,
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
