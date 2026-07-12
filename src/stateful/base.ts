export interface Stateful {
  setState(state: string, fallback?: string): void;
}

export type StatesConfig<StateConfig> = Record<string, StateConfig | undefined>;

export function resolveStateConfig<StateConfig>(
  states: StatesConfig<StateConfig>,
  state: string,
  fallback?: string,
): StateConfig {
  const s = states[state];
  const f = fallback ? states[fallback] : undefined;
  return { ...f, ...s } as StateConfig;
}

export class StatefulComponentList {
  add(child: Stateful): void {
    this._items.push(child);
  }

  setState(state: string, fallback?: string): void {
    for (const c of this._items) c.setState(state, fallback);
  }

  private readonly _items: Stateful[] = [];
}
