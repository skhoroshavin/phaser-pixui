import { Component, type DisplayHost } from "../primitives/component";

export abstract class Mount extends Component {
  protected constructor() {
    super();
  }

  abstract override get displayHost(): DisplayHost;

  abstract override resolveLayout(): void;
}
