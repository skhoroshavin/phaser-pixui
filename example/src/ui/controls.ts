import { Component } from "../../../src/components/component";
import { Button } from "../../../src/components/button";
import type { ClickableConfig } from "../../../src/components/clickable";
import { RadioGroup, type RadioGroupConfig } from "../../../src/components/radiogroup";
import { Slider, type SliderConfig } from "../../../src/components/slider";
import { Text } from "../../../src/components/text";
import { Toggle, type ToggleConfig } from "../../../src/components/toggle";
import { colors, fonts, uiTexture } from "./constants";

/** Button with themed frame and label. */
export function button(parent: Component, text: string, cfg?: ClickableConfig): Button {
  const btn = parent.add(Button, {
    width: 96,
    paddingX: 5,
    paddingY: 5,
    normal: { frame: "button_up" },
    hover: { frame: "button_hover" },
    pressed: { frame: "button_down", offsetY: 1 },
    disabled: { frame: "button_disabled", tint: colors.disabled, offsetY: 1 },
    ...cfg,
  });
  const frame = btn.addImage({ texture: uiTexture, inset: 0, tileX: true, tileY: true });
  btn.node.setIntrinsicSize(frame.node.intrinsicSize());
  btn.add(Text, { font: fonts.normal, text, tint: colors.dark });
  return btn;
}

/** Checkbox with label. Text then box in a row. Returns the Toggle. */
export function checkbox(parent: Component, label: string, cfg?: Partial<ToggleConfig>): Toggle {
  const tgl = parent.add(Toggle, {
    direction: "row",
    gap: 4,
    alignItems: "center",
    normal: { frame: "check_box_normal" },
    selected: { frame: "check_box_selected" },
    hover: { frame: "check_box_hover" },
    disabled: { frame: "check_box_disabled", tint: colors.disabled },
    hover_selected: { frame: "check_box_hover_selected" },
    disabled_selected: { frame: "check_box_disabled_selected", tint: colors.disabled },
    ...cfg,
  });
  tgl.add(Text, { font: fonts.normal, text: label, tint: colors.dark });
  tgl.addImage({ texture: uiTexture });
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
      normal: { frame: "radio_button_normal" },
      selected: { frame: "radio_button_selected" },
      hover: { frame: "radio_button_hover" },
      disabled: { frame: "radio_button_disabled", tint: colors.disabled },
      hover_selected: { frame: "radio_button_hover_selected" },
      disabled_selected: { frame: "radio_button_disabled_selected", tint: colors.disabled },
    });
    tgl.add(Text, { font: fonts.normal, text: label, tint: colors.dark });
    tgl.addImage({ texture: uiTexture });
  }
  return group;
}

/** Slider with label. Row: label then slider. Returns the Slider. */
export function slider(parent: Component, label: string, cfg?: Partial<SliderConfig>): Slider {
  const row = parent.add(Component, {
    direction: "row",
    gap: 4,
    alignItems: "center",
  });
  row.add(Text, { font: fonts.normal, text: label, tint: colors.dark });
  return row.add(Slider, {
    texture: uiTexture,
    trackFrame: "slider_track",
    trackHoverFrame: "slider_track_hover",
    trackDisabledFrame: "slider_track_disabled",
    thumbFrame: "slider_thumb_normal",
    thumbHoverFrame: "slider_thumb_hover",
    thumbPressedFrame: "slider_thumb_pressed",
    thumbDisabledFrame: "slider_thumb_disabled",
    width: 80,
    ...cfg,
  });
}
