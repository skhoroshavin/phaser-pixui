import { Modal } from "../../../src/components/modal";
import { Component } from "../../../src/components/component";
import { button } from "./buttons";
import { frame, text } from "./visuals";

export function load_dialog(parent: Component, log: (msg: string) => void) {
  const modal = new Modal(parent, {
    dismissOnBackdropClick: true,
    onDismiss: () => log("Dialog dismissed by backdrop click"),
  });

  const panel = frame(modal.content, {
    frame: "frame_bright",
    width: 256,
    height: 80,
    direction: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  });

  text(panel, {
    text: "There are no saved games",
  });

  button(panel, {
    text: "OK",
    width: 64,
    onClick: () => (modal.visible = false),
  });

  return modal;
}
