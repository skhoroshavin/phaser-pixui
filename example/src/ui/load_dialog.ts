import { Modal } from "../../../src/core2/modal";
import { Component } from "../../../src/core2/component";
import { Frame } from "../../../src/styled2/frame";
import { Text } from "../../../src/styled2/text";
import { Button } from "../../../src/styled2/button";

export function load_dialog(parent: Component, log: (msg: string) => void) {
  const modal = new Modal(parent, {
    dismissOnBackdropClick: true,
    onDismiss: () => log("Dialog dismissed by backdrop click"),
  });

  const frame = new Frame(modal.content, {
    style: { frame: "frame_bright", tileX: true, tileY: true },
    width: 256,
    height: 80,
    direction: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  });

  new Text(frame, {
    text: "There are no saved games",
  });

  new Button(frame, {
    text: "OK",
    width: 64,
    onClick: () => (modal.visible = false),
  });

  return modal;
}
