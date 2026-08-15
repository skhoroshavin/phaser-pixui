import { Math as PMath } from "phaser";
import { Component, type ComponentConfig, type ComponentCtor } from "../primitives/component";

/**
 * A container that shows exactly one page at a time, hiding all others.
 * Pages are added via {@link PageStack.addPage}.
 */
export class PageStack extends Component {
  constructor(parent: Component, cfg?: ComponentConfig) {
    super(parent, cfg);
  }

  /** Adds a new page. */
  addPage<T extends Component, A extends unknown[]>(
    Ctor: ComponentCtor<T, A>,
    ...args: NoInfer<A>
  ): T {
    const page = this.add(Ctor, ...args);
    page.visible = this._pages.length === this._current;
    this._pages.push(page);
    return page;
  }

  /**
   * Index of the currently visible page, clamped to the valid range.
   * Setting it shows the page at that index and hides all others.
   */
  get current(): number {
    return this._current;
  }
  set current(i: number) {
    i = PMath.Clamp(i, 0, this._pages.length - 1);
    if (i === this._current) return;
    this._current = i;
    for (const [idx, page] of this._pages.entries()) {
      page.visible = idx === i;
    }
  }

  private readonly _pages: Component[] = [];
  private _current = 0;
}
