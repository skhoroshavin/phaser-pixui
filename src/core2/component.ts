import { createNode, type BoxConfig, type Node } from "../layout/node";
import type { ViewportMount } from "./viewport-mount";

export class Component {
  constructor(parent: Component | undefined, cfg?: BoxConfig) {
    this.node = createNode({ box: cfg });
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
