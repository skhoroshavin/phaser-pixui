import { Image } from "../core/image.ts";
import { FrameStyle } from "../theme/frame.ts";
import { findStyle } from "../theme/theme.ts";
import { InsertContext } from "./context.ts";
import { StyledComponent, StyledComponentConfig } from "./styled.ts";

export type FrameConfig = StyledComponentConfig & {
  styleObject?: FrameStyle;
};

export class Frame extends StyledComponent {
  constructor(ctx: InsertContext, cfg: FrameConfig) {
    super(ctx, cfg);
    const style = cfg.styleObject ?? findStyle("Frame", cfg.style, ctx.theme.frame);

    this._image = this.insert.image({
      texture: ctx.theme.resources.atlas,
      frame: style.frame!,
      tileX: style.tileX,
      tileY: style.tileY,
    });

    const paddingX = style.paddingX ?? 0;
    const paddingY = style.paddingY ?? 0;
    const inner = this.insert.container({
      width: -2 * paddingX,
      height: -2 * paddingY,
    });

    // Redefine container of component factory used to create children components
    this.insert.setContainer(inner);
  }

  protected override updateVisible(visible: boolean) {
    super.updateVisible(visible);
    this._image.visible = visible;
  }

  private readonly _image: Image;
}
