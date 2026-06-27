import { ComponentFactory, ComponentFactoryConfig } from "../core/factory.ts";
import { ThemeConfig } from "../theme/theme.ts";
import { Button, ButtonConfig } from "./button.ts";
import { InsertContext } from "./context.ts";
import { Frame, FrameConfig } from "./frame.ts";
import { Progress, ProgressConfig } from "./progress.ts";
import { ScrollableTextArea, ScrollableTextAreaConfig } from "./scrollable-textarea.ts";
import { StyledComponent, StyledComponentConfig } from "./styled.ts";
import { TextArea, TextAreaConfig } from "./textarea.ts";

export type StyledComponentFactoryConfig = {
  theme: ThemeConfig;
} & ComponentFactoryConfig;

export class StyledComponentFactory extends ComponentFactory {
  constructor(cfg: StyledComponentFactoryConfig) {
    super(cfg);
    this.theme = cfg.theme;
  }
  readonly theme: ThemeConfig;

  container(cfg?: StyledComponentConfig): StyledComponent {
    return this.createStyled(StyledComponent, cfg);
  }

  frame(cfg: FrameConfig): Frame {
    return this.createStyled(Frame, cfg);
  }

  button(cfg: ButtonConfig): Button {
    return this.createStyled(Button, cfg);
  }

  progress(cfg: ProgressConfig): Progress {
    return this.createStyled(Progress, cfg);
  }

  textArea(cfg: TextAreaConfig): TextArea {
    return this.createStyled(TextArea, cfg);
  }

  scrollableTextArea(cfg: ScrollableTextAreaConfig): ScrollableTextArea {
    return this.createStyled(ScrollableTextArea, cfg);
  }

  createStyled<T extends StyledComponent, Cfg>(
    Ctor: new (ctx: InsertContext, cfg: Cfg) => T,
    cfg: Cfg,
  ): T {
    const ctx = new InsertContext(this.scene, this.theme);
    const instance = new Ctor(ctx, cfg);
    this._container.attach(instance, this.originX, this.originY);
    return instance;
  }
}
