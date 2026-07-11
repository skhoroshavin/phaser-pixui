import { type Mount, Modal } from "phaser-pixui";
import { button } from "./controls";
import { frame, text } from "./visuals";

export function load_dialog(parent: Mount, log: (msg: string) => void) {
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
