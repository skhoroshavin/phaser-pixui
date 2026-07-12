import { frameDimensions } from "../shared/frame";
import { Component } from "../primitives/component";
import { Image, type ImageConfig } from "../primitives/image";
import { resolveStateConfig, Stateful, StatesConfig } from "./base.ts";

export type ImageStateConfig = {
  frame?: string;
  offsetX?: number;
  offsetY?: number;
};

export type StatefulImageConfig = ImageConfig & {
  states: StatesConfig<ImageStateConfig>;
};

export class StatefulImage extends Image implements Stateful {
  constructor(parent: Component, cfg: StatefulImageConfig) {
    super(parent, cfg);
    this._defaultFrame = cfg.frame;
    this._states = cfg.states;
    const scene = this.displayHost.scene!;
    const frameNames = Object.values(cfg.states).map((s) => s?.frame ?? cfg.frame);
    const frames = frameNames.map((f) => frameDimensions(scene.textures.getFrame(cfg.texture, f)));
    this.node.setIntrinsicSize(
      frames.reduce(
        (acc, d) => ({
          width: Math.max(acc.width, d.width),
          height: Math.max(acc.height, d.height),
        }),
        { width: 0, height: 0 },
      ),
    );
  }

  setState(state: string, fallback?: string): void {
    const s = resolveStateConfig(this._states, state, fallback);
    this.internal.setFrame(s.frame ?? this._defaultFrame);
    this.setOffsetX(s.offsetX ?? 0);
    this.setOffsetY(s.offsetY ?? 0);
  }

  private readonly _defaultFrame: string;
  private readonly _states: StatesConfig<ImageStateConfig>;
}
