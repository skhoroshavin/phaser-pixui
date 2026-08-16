import { Component, type ComponentConfig } from "../primitives/component";
import { type ImageConfig } from "../primitives/image";
import { StatefulComponentList } from "../stateful/base";
import { type ImageValueConfig, StatefulImage } from "../stateful/image";

/** {@link ProgressBar} configuration. */
export type ProgressBarConfig = ComponentConfig & {
  /** Initial value, between `0` and `1`. Defaults to `0`. */
  value?: number;
};

/**
 * A headless progress bar. Renders nothing by itself, the visual is provided
 * via {@link ProgressBar.addImage}. The value is a number between `0` and `1`.
 */
export class ProgressBar extends Component {
  constructor(parent: Component, cfg: ProgressBarConfig = {}) {
    super(parent, cfg);
    this._value = cfg.value ?? 0;
  }

  /**
   * Adds an image that can be moved or scaled based on the progress value.
   */
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

  /** Current value, clamped to the range `0..1`. */
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
