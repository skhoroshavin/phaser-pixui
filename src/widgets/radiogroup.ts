import { Component, type ComponentConfig } from "../primitives/component";
import { Toggle, type ToggleConfig } from "./toggle";

/** {@link RadioGroup} configuration. */
export type RadioGroupConfig = ComponentConfig & {
  /** Initially selected toggle index. Defaults to `0`. */
  selectedIndex?: number;
  /** Called when the selection changes as a result of user interaction. */
  onChange?: (index: number) => void;
};

/**
 * A group of {@link Toggle} components where exactly one toggle is always
 * selected. Selection is mutually exclusive.
 */
export class RadioGroup extends Component {
  constructor(parent: Component, cfg: RadioGroupConfig = {}) {
    const { selectedIndex, onChange, ...layout } = cfg;
    super(parent, layout);
    this._onChange = onChange;
    this._selectedIndex = selectedIndex ?? 0;
  }

  /** Adds a toggle to this group. */
  addToggle(cfg: Omit<ToggleConfig, "onChange" | "checked">): Toggle {
    const index = this._toggles.length;
    const tgl = this.add(Toggle, {
      ...cfg,
      onChange: (checked: boolean) => {
        if (checked) {
          this.selectedIndex = index;
          this._onChange?.(index);
        } else {
          tgl.checked = true; // Toggle tried to uncheck itself.
        }
      },
    });
    this._toggles.push(tgl);
    tgl.checked = index === this._selectedIndex;
    return tgl;
  }

  /** Toggles belonging to this group, in the order they were added. */
  get toggles(): readonly Toggle[] {
    return this._toggles;
  }

  /** Index of the currently selected toggle. */
  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(i: number) {
    if (i === this._selectedIndex) return;
    this._checkCurrentToggle(false);
    this._selectedIndex = i;
    this._checkCurrentToggle(true);
  }

  private _checkCurrentToggle(v: boolean): void {
    const toggle = this._toggles[this._selectedIndex];
    if (toggle) toggle.checked = v;
  }

  private readonly _toggles: Toggle[] = [];
  private _selectedIndex: number;
  private readonly _onChange?: (index: number) => void;
}
