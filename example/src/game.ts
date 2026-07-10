import type { GameObjects } from "phaser";
import { ConstraintMode, ResponsiveScene } from "phaser-pixui";

export class GameWorld extends ResponsiveScene {
  constructor() {
    super({
      key: "game-world",
      viewportConstraints: {
        mode: ConstraintMode.Maximum,
        width: 384,
        height: 216,
      },
    });
  }

  npc!: GameObjects.Sprite;

  preload() {
    this.load.setPath("packed_assets");
    this.load.image("bg_plains00", "tiopalada/bg_plains00.png");
    this.load.atlas("npc", "npc.png", "npc.atlas");
  }

  create() {
    super.create();
    const background = this.add.image(0, 0, "bg_plains00");
    const placeBackground = () => {
      background.setPosition(
        Math.floor(this.viewport.width / 2),
        Math.floor(this.viewport.height / 2),
      );
    };
    placeBackground();
    this.scale.on("resize", placeBackground);

    for (const dir of ["right", "left"]) {
      this.anims.create({
        key: `npc-walk-${dir}`,
        frames: this.anims.generateFrameNames("npc", {
          prefix: `npc_walk_${dir}`,
          zeroPad: 2,
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.npc = this.add.sprite(0, 0, "npc", "npc_walk_right00");
    const placeNpc = () => this.npc.setY(this.viewport.height - 48);
    placeNpc();
    this.scale.on("resize", placeNpc);
    this.npc.play("npc-walk-right");
    this.tweens.add({
      targets: this.npc,
      x: { from: 30, to: 90 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      onYoyo: () => this.npc.play("npc-walk-left"),
      onRepeat: () => this.npc.play("npc-walk-right"),
    });
  }
}
