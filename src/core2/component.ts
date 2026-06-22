import { createNode, type BoxConfig, type Node } from "../layout/node";
import type { ViewportMount } from "./viewport-mount";

export class Component {
  constructor(mount: ViewportMount, cfg?: BoxConfig) {
    this.node = createNode({ box: cfg });
    this.mount = mount;
    mount.root.children.push(this.node);
  }

  readonly node: Node;
  readonly mount: ViewportMount;

  markDirty(): void {}
}
