import {FontStyle, initBaseFontStyle} from "./font.ts";
import {ButtonStyle, initButtonStyle} from "./button.ts";
import {initTextAreaStyle, TextAreaStyle} from "./textarea.ts";
import {ProgressStyle, initProgressStyle} from "./progress.ts";

type Texture = Phaser.Textures.Texture;

export type ThemeConfig = {
    resources: {
        basePath?: string;
        texture: string;
        fonts: string[];
    }

    palette: Palette;

    button: StyleList<ButtonStyle>;
    progress: StyleList<ProgressStyle>;
    textArea: StyleList<TextAreaStyle>;
} & FontStyle

export type Palette = {
    default: number
    [key: string]: number
}

export function resolveColor(color: string | undefined, palette: Palette): number {
    if (color === undefined || !(color in palette))
        return palette.default;
    return palette[color]!;
}

export type StyleList<StyleType extends object> = StyleType & { styles?: { [key: string]: StyleType }}

export function findStyle<StyleType extends object>(type: string, name: string | undefined, list: StyleList<StyleType>): StyleType {
    if (name === undefined) return list
    if (list.styles === undefined) {
        console.warn(`${type} style '${name}' not found, only default is available`)
        return list
    }
    if (!(name in list.styles!)) {
        console.warn(`${type} style '${name} not found, available are: ${Object.keys(list.styles!).join(',')}` );
        return list
    }
    return list.styles![name]!
}

export function initTheme(theme: ThemeConfig, atlas: Texture) {
    initBaseFontStyle(theme)
    initButtonStyle(theme.button, theme, atlas)
    initProgressStyle(theme.progress)
    initTextAreaStyle(theme.textArea, theme)
}
