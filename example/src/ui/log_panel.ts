import { type Component, type ComponentConfig, ScrollArea, type Text } from "phaser-pixui";
import { text } from "./visuals.ts";

export class LogPanel extends ScrollArea {
  constructor(parent: Component, cfg?: ComponentConfig) {
    super(parent, { axis: "y", ...cfg });
    this._txt = this.content.add(text, {});
  }

  write(msg: string) {
    const t = this._txt.text + msg + "\n";
    this._txt.text = t.split("\n").slice(-200).join("\n");
    this.scrollToEnd();
  }

  private readonly _txt: Text;
}
