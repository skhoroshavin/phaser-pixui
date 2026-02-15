import {ComponentConfig} from "../core/component.ts";
import {Scene} from "phaser";
import {Container} from "../core/container.ts";
import {ThemeConfig} from "../theme/theme.ts";

export type StyledComponentConfig = {
    style?: string;
} & ComponentConfig

export class StyledComponent extends Container {
    constructor(scene: Scene, theme: ThemeConfig, cfg: StyledComponentConfig) {
        super(scene, cfg);
        this.theme = theme
    }
    readonly theme: ThemeConfig;
}
