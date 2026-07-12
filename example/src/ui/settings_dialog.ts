import { Component, Modal } from "phaser-pixui";
import { button, checkbox, radiogroup, slider } from "./controls";
import { frame, text } from "./visuals";
import { fonts } from "./constants";

export function settings_dialog(parent: Component, log: (msg: string) => void) {
  const modal = parent.add(Modal, {
    dismissOnBackdropClick: true,
    onDismiss: () => log("Settings dismissed"),
  });

  const panel = modal.content.add(frame, {
    direction: "column",
    paddingX: 16,
    paddingY: 12,
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  });

  panel.add(text, { font: fonts.title, text: "Settings" });

  const ambientSlider = panel.add(slider, "Ambient", {
    value: 0.5,
    onChange: (v) => log(`Ambient: ${Math.round(v * 100)}%`),
  });

  const effectsSlider = panel.add(slider, "Effects", {
    value: 0.7,
    onChange: (v) => log(`Effects: ${Math.round(v * 100)}%`),
  });

  panel.add(checkbox, "Enable sound", {
    checked: true,
    onChange: (checked) => {
      ambientSlider.enabled = checked;
      effectsSlider.enabled = checked;
    },
  });

  const difficulties = ["Easy", "Medium", "Hard"];
  const difficulty = panel.add(radiogroup, difficulties, {
    direction: "row",
    gap: 8,
    selectedIndex: 1,
    onChange: (i) => log(`Difficulty: ${difficulties[i]}`),
  });
  difficulty.toggles[2]!.enabled = false;

  panel.add(button, "Done", {
    width: 64,
    onClick: () => (modal.visible = false),
  });

  return modal;
}
