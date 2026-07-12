import { Component, type ComponentConfig } from "./component";

export class Container extends Component {
  constructor(parent: Component, cfg?: ComponentConfig) {
    super(parent, cfg);
  }
}
