import { CANVAS, HEADLESS, VERSION, WEBGL } from "phaser";
import { ConstraintMode, UiScene } from "../../src";
import { Component } from "../../src/core2/component.ts";
import { BitmapText } from "../../src/core2/bitmap-text.ts";
import { ScrollArea } from "../../src/core2/scroll-area.ts";
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
    const logFrame = new Frame(this.root, {
      bottom: 2,
      left: 2,
      right: 2,
      height: 84,
    });
    this._logScroll = new ScrollArea(logFrame, { axis: "y", inset: 0 });
    this._logText = new Text(this._logScroll.content, { left: 0, right: 0 });

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

    const loadDialog = load_dialog(this.root, (msg) => this.log(msg));

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
      left: 0,
      right: 0,
      marginX: "auto",
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
    });
    new Text(headerFrame, {
      style: "header_scroll",
      text: "Phaser-PixUI demo",
    });

    const buttonStack = new Component(this.root, {
      inset: 0,
      direction: "column",
      gap: 2,
      justifyContent: "center",
      alignItems: "center",
    });

    new Button(buttonStack, {
      text: "New game",
      width: 128,
      onClick: () => this.log("New game is already started!"),
    });
    new Button(buttonStack, {
      text: "Load game",
      width: 128,
      onClick: () => (loadDialog.visible = true),
    });
    new Button(buttonStack, {
      text: "Exit",
      width: 128,
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
    const text = this._logText.text + msg + "\n";
    const lines = text.split("\n");
    this._logText.text = lines.slice(-200).join("\n");
    this._logScroll.scrollToEnd();
  }
  private _logScroll!: ScrollArea;
  private _logText!: Text;
}
