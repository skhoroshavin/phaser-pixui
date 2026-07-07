import type { Component } from "./component";
import { MultiImage } from "./multi-image";
import { PhaserObject } from "./phaser-object";

export function applyViewState(children: readonly Component[], v: ViewState): void {
  for (const child of children) {
    if (child instanceof MultiImage) {
      child.setFrame(v.frame);
    } else if (child instanceof PhaserObject) {
      if (v.tint !== undefined) child.setTint(v.tint);
      child.setOffsetX(v.offsetX ?? 0);
      child.setOffsetY(v.offsetY ?? 0);
    }
  }
}

export type ViewState = {
  frame: string;
  tint?: number;
  offsetX?: number;
  offsetY?: number;
};
