import { Component, type ComponentConfig } from "./component";
import type { Mount } from "../mounts/mount";
import { Toggle, type ToggleConfig } from "./toggle";

export type RadioGroupConfig = ComponentConfig & {
  selectedIndex?: number;
  onChange?: (index: number) => void;
};

export class RadioGroup extends Component {
  constructor(parent: Mount, cfg: RadioGroupConfig = {}) {
    const { selectedIndex, onChange, ...layout } = cfg;
    super(parent, layout);
    this._onChange = onChange;
    this._selectedIndex = selectedIndex ?? 0;
  }

  addToggle(cfg: Omit<ToggleConfig, "onChange" | "checked">): Toggle {
    const index = this._toggles.length;
    const tgl = this.add(Toggle, {
      ...cfg,
      onChange: (checked: boolean) => {
        if (checked) {
          this.selectedIndex = index;
        } else {
          tgl.checked = true; // Toggle tried to uncheck itself.
        }
      },
    });
    this._toggles.push(tgl);
    tgl.checked = index === this._selectedIndex;
    return tgl;
  }

  get toggles(): readonly Toggle[] {
    return this._toggles;
  }

  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(i: number) {
    if (i === this._selectedIndex) return;
    this._checkCurrentToggle(false);
    this._selectedIndex = i;
    this._checkCurrentToggle(true);
    this._onChange?.(i);
  }

  private _checkCurrentToggle(v: boolean): void {
    const toggle = this._toggles[this._selectedIndex];
    if (toggle) toggle.checked = v;
  }

  private readonly _toggles: Toggle[] = [];
  private _selectedIndex: number;
  private readonly _onChange?: (index: number) => void;
}
