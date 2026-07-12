import { type ComponentConfig, Component, Image, Text, type TextConfig } from "phaser-pixui";
import { colors, fonts, uiTexture } from "./constants.ts";

export type FrameConfig = ComponentConfig & { frame?: string };

export function frame(parent: Component, cfg: FrameConfig = {}) {
  return parent.add(Image, {
    texture: uiTexture,
    frame: "frame",
    tileX: true,
    tileY: true,
    paddingX: 9,
    paddingY: 8,
    ...cfg,
  });
}

export function text(parent: Component, cfg: Partial<TextConfig>) {
  return parent.add(Text, { font: fonts.normal, tint: colors.dark, ...cfg });
}

export function header(parent: Component, title: string, cfg: ComponentConfig = {}): Image {
  const headerFrame = parent.add(frame, {
    frame: "frame-header",
    marginX: "auto",
    paddingX: 16,
    alignItems: "center",
    ...cfg,
  });
  headerFrame.add(text, {
    font: fonts.title,
    tint: colors.dark,
    align: "center",
    text: title,
  });
  return headerFrame;
}

export function chat_bubble(
  parent: Component,
  content: string,
  cfg: ComponentConfig = {},
): { bubble: Image; bubbleText: Text } {
  const bubble = parent.add(Image, {
    texture: uiTexture,
    frame: "chat_bubble",
    positionTryFallbacks: ["flip-inline"],
    maxWidth: 80,
    paddingX: 8,
    paddingY: 6,
    ...cfg,
  });
  const bubbleText = bubble.add(text, { text: content });
  return { bubble, bubbleText };
}
