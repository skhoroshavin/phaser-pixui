import {UiScene} from "phaser-pixui";
import {ConstraintMode} from "phaser-pixui";
import {TextArea} from "phaser-pixui";
import {TextAlign} from "phaser-pixui";
import {resolveColor} from "../../src";
import {GameWorld} from "./game.ts";

export class Ui extends UiScene
{
    constructor () {
        super({
            key: "ui",
            active: true,
            viewportConstraints: {
                mode: ConstraintMode.Minimum,
                height: 320,
            },
            theme: {
                resources: {
                    basePath: "assets",
                    texture: "mana_soul",
                    fonts: ["mana_roots", "mana_trunk", "mana_branches"]
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

                    styles: {
                        settings: {
                            frame: "button_settings",
                            shape: "diamond",
                        }
                    }
                },

                progress: {
                    frame: "progress_curly",
                    bar: "bar_green",
                    paddingX: 5,
                    paddingY: 3,
                },

                textArea: {
                    frame: "frame_light",
                    paddingX: 12,
                    paddingY: 14,

                    styles: {
                        header_scroll: {
                            frame: "header_scroll",
                            fontName: "mana_trunk",
                            fontTint: "dark",
                            paddingX: 30,
                            paddingY: 8,
                            defaultAlign: TextAlign.Middle
                        }
                    }
                }
            }
        });
    }

    create() {
        super.create();
        this.scene.bringToTop('ui')
        this._logArea = this.insert.bottom.scrollableTextArea({
            y: 2,
            width: -4,
            height: 84,
        })

        const progress = this.insert.bottom.progress({
            y: 108,
            width: 240,
            height: 24,
            visible: false,
        })
        const game = this.scene.get<GameWorld>("game-world")
        game.events.on('start', () => {
            progress.value = 0; progress.visible = true
            game.load.on('progress', (v: number) => {
                progress.value = v
            })
            game.load.once('complete', () => {
                progress.visible = false
            })
        })
        this.scene.launch(game)

        this.insert.bottomRight.bitmapText({
            x: 4, y: 88,
            font: 'mana_branches',
            tint: resolveColor('dark', this.theme.palette),
            text: 'Phaser PixUI v0.1.0',
        })

        this.insert.top.textArea({
            style: 'header_scroll',
            y: 64,
            width: 192,
            height: 32,
            text: 'Phaser-PixUI demo',
        })

        this.insert.center.button({
            y: -24,
            text: "New game",
            onClick: () => this.log("New game is already started!")
        })
        this.insert.center.button({
            text: "Load game",
            onClick: () => this.log("There are no saved games yet...")
        })
        this.insert.center.button({
            y: 24,
            text: "Exit",
            enabled: false,
            onClick: () => this.log("There is no escape :)")
        })

        this.insert.topRight.button({
            style: "settings",
            x: 4, y: 4,
            onClick: () => this.log("What do you want to customize here?")
        })

        const dps = window.devicePixelRatio || 1
        let rendererType;
        switch (this.renderer.type) {
            case Phaser.CANVAS: rendererType = "Canvas"; break;
            case Phaser.WEBGL: rendererType = "WebGL"; break;
            case Phaser.HEADLESS: rendererType = "Headless"; break;
            default: rendererType = "Unknown";
        }
        this.log(`Phaser ${Phaser.VERSION}, renderer ${rendererType}, device pixel ratio ${dps}`)

        const messages = [
            'The sun is shining',
            'The birds are singing',
            'Life is beautiful',
            'You feel an urge to scroll through logs',
            'Suddenly your back starts itching',
            'A gust of wind sways the grass',
            'Was für ein wunderschönen Tag!',
            'Hoffentlich gibt es keinen Ärger hier...'
        ]
        setInterval(() => this.log(messages[Math.floor(Math.random() * messages.length)]), 5000)

        this.scale.on("resize", () => {
            const dpr = window.devicePixelRatio || 1;
            const game = this.scene.get<GameWorld>("game-world")
            this.log(`Canvas ${window.innerWidth*dpr}x${window.innerHeight*dpr}, UI ${this.viewport.width}x${this.viewport.height}, game ${game.viewport.width}x${game.viewport.height}`);
        })
    }

    log(msg: string) {
        const text = this._logArea.text + msg + '\n'
        // Split into lines and keep only the last 200 lines
        const lines = text.split('\n')
        if (lines.length > 200) {
            // Keep the last 200 lines
            const trimmedLines = lines.slice(-200)
            this._logArea.text = trimmedLines.join('\n')
        } else {
            this._logArea.text = text
        }
    }
    private _logArea!: TextArea
}
