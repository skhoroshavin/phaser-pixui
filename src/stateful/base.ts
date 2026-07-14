export interface Stateful {
  setState(state: string | undefined, fallback?: string): void;
  setValue(value: number): void;
}

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
