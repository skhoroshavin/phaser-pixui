import { createNode, type Layout, type Node } from "../layout";
import type { ViewportMount } from "./viewport-mount";

export type ComponentConfig = Layout;

export class Component {
  constructor(parent: Component | undefined, cfg?: ComponentConfig) {
    this.node = createNode({ layout: cfg });
    if (parent) {
      this.mount = parent.mount;
      parent.add(this);
    }
  }

  readonly node: Node;
  mount!: ViewportMount;

  add(child: Component): void {
    this.node.children.push(child.node);
  }
}
