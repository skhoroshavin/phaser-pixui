import { createNode, type BoxConfig, type Node } from "../layout/node";
import type { ViewportMount } from "./viewport-mount";

export class Component {
  readonly node: Node;
  readonly mount: ViewportMount;

  constructor(mount: ViewportMount, cfg?: BoxConfig) {
    this.node = createNode({ box: cfg });
    this.mount = mount;
    mount.root.children.push(this.node);
  }

  markDirty(): void {}
}
