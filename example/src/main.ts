import { Game, Scale } from 'phaser';
import { Ui } from './ui.ts';
import {GameWorld} from "./game.ts";

const { ScaleModes } = Scale;

const dpr = window.devicePixelRatio || 1;

const config: Phaser.Types.Core.GameConfig = {
    parent: 'game-container',
    autoFocus: true,
    pixelArt: true,
    scale: {
        mode: ScaleModes.NONE,
        width: window.innerWidth * dpr,
        height: window.innerHeight * dpr,
        zoom: 1 / dpr,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Ui,
        GameWorld
    ]
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });

    window.addEventListener('resize', () =>
        game.scale.resize(window.innerWidth * dpr, window.innerHeight * dpr))

    return game
}

document.addEventListener('DOMContentLoaded', () => {
    StartGame('game-container');
});