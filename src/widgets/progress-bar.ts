import { Component, type ComponentConfig } from "../primitives/component";
import { type ImageConfig } from "../primitives/image";
import { StatefulComponentList } from "../stateful/base";
import { type ImageValueConfig, StatefulImage } from "../stateful/image";

export type ProgressBarConfig = ComponentConfig & {
  value?: number;
};

export class ProgressBar extends Component {
  constructor(parent: Component, cfg: ProgressBarConfig = {}) {
    super(parent, cfg);
    this._value = cfg.value ?? 0;
  }

  addImage(cfg: ImageConfig & ImageValueConfig): StatefulImage {
    const img = this.add(StatefulImage, {
      ...cfg,
      valueBinding: {
        mode: cfg.mode,
        axis: cfg.axis,
        minSize: cfg.minSize,
        visibleMin: cfg.visibleMin,
        visibleMax: cfg.visibleMax,
      },
    });
    this._statefulChildren.add(img);
    img.setValue(this._value);
    return img;
  }

  get value(): number {
    return this._value;
  }
  set value(v: number) {
    v = Math.max(0, Math.min(1, v));
    if (this._value === v) return;
    this._value = v;
    this._statefulChildren.setValue(v);
  }

  private _value: number;
  private readonly _statefulChildren = new StatefulComponentList();
}
