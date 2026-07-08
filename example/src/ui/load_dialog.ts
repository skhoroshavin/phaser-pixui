import { Modal } from "../../../src/components/modal";
import { Component } from "../../../src/components/component";
import { button } from "./buttons";
import { frame, text } from "./visuals";

export function load_dialog(parent: Component, log: (msg: string) => void) {
  const modal = parent.add(Modal, {
    dismissOnBackdropClick: true,
    onDismiss: () => log("Dialog dismissed by backdrop click"),
  });

  const panel = modal.content.add(frame, {
    direction: "column",
    paddingX: 16,
    paddingY: 12,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  });

  panel.add(text, {
    text: "There are no saved games",
  });

  panel.add(button, "OK", {
    width: 64,
    onClick: () => (modal.visible = false),
  });

  return modal;
}
