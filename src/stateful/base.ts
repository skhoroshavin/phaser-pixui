/**
 * A component whose appearance can change based on a state string and a
 * numeric value. Used by widgets to drive their visuals.
 */
export interface Stateful {
  /** Applies the given state, falling back to `fallback` state config. */
  setState(state: string | undefined, fallback?: string): void;
  /** Applies the given value. */
  setValue(value: number): void;
}

/** Mapping of state names to state-specific component configuration. */
export type StatesConfig<StateConfig> = Record<string, StateConfig | undefined>;

export function resolveStateConfig<StateConfig>(
  states: StatesConfig<StateConfig>,
  state: string | undefined,
  fallback?: string,
): StateConfig {
  const s = state === undefined ? undefined : states[state];
  const f = fallback ? states[fallback] : undefined;
  return { ...f, ...s } as StateConfig;
}

export class StatefulComponentList {
  add(child: Stateful): void {
    this._items.push(child);
  }

  setState(state: string | undefined, fallback?: string): void {
    for (const c of this._items) c.setState(state, fallback);
  }

  setValue(value: number): void {
    for (const c of this._items) c.setValue(value);
  }

  private readonly _items: Stateful[] = [];
}
