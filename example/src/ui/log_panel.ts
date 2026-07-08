import { Component, type ComponentConfig } from "../../../src/components/component";
import { ScrollArea } from "../../../src/components/scroll-area";
import { frame, text } from "./visuals.ts";

export function log_panel(parent: Component, cfg?: ComponentConfig) {
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
