import { Component, type ComponentConfig } from "./component";

/** A component that has no game object, useful for grouping other components. */
export class Container extends Component {
  constructor(parent: Component, cfg?: ComponentConfig) {
    super(parent, cfg);
  }
}
