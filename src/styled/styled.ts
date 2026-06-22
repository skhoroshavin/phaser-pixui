import { ComponentConfig } from "../core/component.ts";
import { Container } from "../core/container.ts";
import type { InsertContext } from "./context.ts";

export type StyledComponentConfig = {
  style?: string;
} & ComponentConfig;

export class StyledComponent extends Container {
  constructor(ctx: InsertContext, cfg?: StyledComponentConfig) {
    super(ctx.scene, cfg);
    this._insert = ctx;
    ctx.setContainer(this);
  }

  get insert() {
    return this._insert;
  }
  private readonly _insert: InsertContext;

  get theme() {
    return this._insert.theme;
  }
}
