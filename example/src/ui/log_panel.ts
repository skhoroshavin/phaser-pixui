import { type ComponentConfig, type Mount, ScrollArea } from "phaser-pixui";
import { frame, text } from "./visuals.ts";

export function log_panel(parent: Mount, cfg?: ComponentConfig) {
  const bg = parent.add(frame, { ...cfg });
  const scroll = bg.add(ScrollArea, { axis: "y", grow: 1 });
  const txt = scroll.content.add(text, {});
  return {
    write(msg: string) {
      const t = txt.text + msg + "\n";
      txt.text = t.split("\n").slice(-200).join("\n");
      scroll.scrollToEnd();
    },
  };
}
