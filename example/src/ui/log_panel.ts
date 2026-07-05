import { Component, type ComponentConfig } from "../../../src/components/component";
import { ScrollArea } from "../../../src/components/scroll-area";
import { frame, text } from "./visuals.ts";

export function log_panel(parent: Component, cfg?: ComponentConfig) {
  const bg = frame(parent, { ...cfg, frame: "frame_light", paddingX: 12, paddingY: 14 });
  const scroll = new ScrollArea(bg, { axis: "y", inset: 0 });
  const txt = text(scroll.content, { left: 0, right: 0 });
  return {
    write(msg: string) {
      const t = txt.text + msg + "\n";
      txt.text = t.split("\n").slice(-200).join("\n");
      scroll.scrollToEnd();
    },
  };
}
