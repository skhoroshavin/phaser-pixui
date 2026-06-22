import { TextAlign } from "../../../src";
import type { InsertContext } from "../../../src";

export function load_dialog(ctx: InsertContext) {
  const dialog = ctx.dialog({
    width: 256,
    height: 80,
  });
  dialog.insert.textArea({
    y: -16,
    text: "There are no saved games",
    textAlign: TextAlign.Center,
  });
  dialog.insert.button({
    y: 16,
    text: "OK",
    onClick: () => (dialog.visible = false),
  });

  return dialog;
}
