import {Position} from "./position.ts";
import {Size} from "./size.ts";

// Describes origin configuration of component
export type OriginConfig = {
    originX?: OriginX,
    originY?: OriginY,
}

// Describes actual origin
export type Origin = {
    originX: OriginX,
    originY: OriginY,
}

export enum OriginX { Center, Left, Right}
export enum OriginY { Center, Top, Bottom}

export function calcOrigin(cfg: OriginConfig, fallback: Origin): Origin {
    return {
        originX: cfg.originX ?? fallback.originX,
        originY: cfg.originY ?? fallback.originY,
    }
}

export function calcOriginOffsetFromCenter(s: Size, origin: Origin): Position {
    return {
        x: calcOriginOffsetX(s.width, origin.originX),
        y: calcOriginOffsetY(s.height, origin.originY),
    }
}

function calcOriginOffsetX(width: number, origin: OriginX): number {
    switch (origin) {
        case OriginX.Left: return -Math.floor(width / 2);
        case OriginX.Right: return Math.floor(width / 2);
        default: return 0;
    }
}

function calcOriginOffsetY(height: number, origin: OriginY): number {
    switch (origin) {
        case OriginY.Top: return -Math.floor(height / 2);
        case OriginY.Bottom: return Math.floor(height / 2);
        default: return 0;
    }
}
