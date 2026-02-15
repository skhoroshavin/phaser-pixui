import {ConstraintMode} from "phaser-pixui";
import {ResponsiveScene} from "../../src";

export class GameWorld extends ResponsiveScene
{
    constructor () {
        super({
            key: "game-world",
            viewportConstraints: {
                mode: ConstraintMode.Maximum,
                width: 384,
                height: 216,
            }
        })
    }

    preload() {
        this.load.setPath('assets')
        this.load.image('bg_plains00')
    }

    create() {
        super.create();
        const background = this.add.image(0, 0, "bg_plains00")
        const placeBackground = ()=> {
            background.setPosition(
                Math.floor(this.viewport.width / 2),
                Math.floor(this.viewport.height / 2),
            )
        }
        placeBackground()
        this.scale.on('resize', placeBackground)
    }
}
