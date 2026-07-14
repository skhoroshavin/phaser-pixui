import {
  Button,
  type ButtonConfig,
  Component,
  Container,
  RadioGroup,
  type RadioGroupConfig,
  Slider,
  type SliderConfig,
  Text,
  Toggle,
  type ToggleConfig,
} from "phaser-pixui";
import { colors, fonts, uiTexture } from "./constants";

/** Button with themed frame and label. */
export function button(parent: Component, text: string, cfg?: Partial<ButtonConfig>): Button {
  const btn = parent.add(Button, {
    width: 96,
    paddingX: 5,
    paddingY: 5,
    ...cfg,
  });
  const frame = btn.addImage({
    texture: uiTexture,
    inset: 0,
    tileX: true,
    tileY: true,
    frame: "button_up",
    hover: { frame: "button_hover" },
    pressed: { frame: "button_down" },
    disabled: { frame: "button_disabled" },
  });
  btn.node.setIntrinsicSize(frame.node.intrinsicSize());
  btn.addText({
    font: fonts.normal,
    text,
    color: colors.dark,
    pressed: { offsetY: 1 },
    disabled: { color: colors.disabled, offsetY: 1 },
  });
  return btn;
}

/** Checkbox with label. Text then box in a row. Returns the Toggle. */
export function checkbox(parent: Component, label: string, cfg?: Partial<ToggleConfig>): Toggle {
  const tgl = parent.add(Toggle, {
    direction: "row",
    gap: 4,
    alignItems: "center",
    ...cfg,
  });
  tgl.addText({
    font: fonts.normal,
    text: label,
    color: colors.dark,
    disabled: { color: colors.disabled },
    disabled_selected: { color: colors.disabled },
  });
  tgl.addImage({
    texture: uiTexture,
    frame: "check_box_normal",
    selected: { frame: "check_box_selected" },
    hover: { frame: "check_box_hover" },
    disabled: { frame: "check_box_disabled" },
    hover_selected: { frame: "check_box_hover_selected" },
    disabled_selected: { frame: "check_box_disabled_selected" },
  });
  return tgl;
}

/** RadioGroup with label for each option. Returns the RadioGroup. */
export function radiogroup(
  parent: Component,
  labels: string[],
  cfg?: RadioGroupConfig,
): RadioGroup {
  const group = parent.add(RadioGroup, {
    direction: "column",
    gap: 4,
    ...cfg,
  });
  for (const label of labels) {
    const tgl = group.addToggle({
      direction: "row",
      gap: 4,
      alignItems: "center",
    });
    tgl.addText({
      font: fonts.normal,
      text: label,
      color: colors.dark,
      disabled: { color: colors.disabled },
      disabled_selected: { color: colors.disabled },
    });
    tgl.addImage({
      texture: uiTexture,
      frame: "radio_button_normal",
      selected: { frame: "radio_button_selected" },
      hover: { frame: "radio_button_hover" },
      disabled: { frame: "radio_button_disabled" },
      hover_selected: { frame: "radio_button_hover_selected" },
      disabled_selected: { frame: "radio_button_disabled_selected" },
    });
  }
  return group;
}

/** Slider with label. Row: label then slider. Returns the Slider. */
export function slider(parent: Component, label: string, cfg?: Partial<SliderConfig>): Slider {
  const row = parent.add(Container, {
    direction: "row",
    gap: 4,
    alignItems: "center",
  });
  row.add(Text, { font: fonts.normal, text: label, color: colors.dark });
  const sld = row.add(Slider, { width: 80, ...cfg });
  sld.addImage({
    texture: uiTexture,
    frame: "slider_track",
    inset: 0,
    marginY: "auto",
    hover: { frame: "slider_track_hover" },
    pressed: { frame: "slider_track_hover" },
    disabled: { frame: "slider_track_disabled" },
  });
  sld.addImage({
    texture: uiTexture,
    frame: "slider_thumb_normal",
    valueBinding: { mode: "position" },
    hover: { frame: "slider_thumb_hover" },
    pressed: { frame: "slider_thumb_pressed" },
    disabled: { frame: "slider_thumb_disabled" },
  });
  return sld;
}
