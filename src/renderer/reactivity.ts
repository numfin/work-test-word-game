type SignalID = Symbol;
type EffectID = Symbol;

/**
 * Signal that allows to subscribe inside effects on "get"
 * and notify subscribers on "set"
 */
export class Signal<T> {
  constructor(private cx: Runtime, private id: SignalID) {}
  get(): T {
    if (this.cx.runningEffectId) {
      if (!this.cx.signalSubs.has(this.id)) {
        this.cx.signalSubs.set(this.id, new Set());
      }
      this.cx.signalSubs.get(this.id)?.add(this.cx.runningEffectId);
    }
    return this.cx.signalValues.get(this.id);
  }
  set(value: T) {
    this.cx.signalValues.set(this.id, value);

    const subIds = this.cx.signalSubs.get(this.id);
    if (subIds) {
      for (const subId of subIds) {
        this.cx.runEffect(subId);
      }
    }

    return value;
  }
  update(fn: (v: T) => T) {
    const value = fn(this.cx.signalValues.get(this.id));
    this.set(value);
    return value;
  }
}

/**
 * "Arena allocator" for reactive values and subscribers
 */
export class Runtime {
  signalValues = new Map<SignalID, any>();
  runningEffectId?: EffectID;
  signalSubs = new Map<SignalID, Set<EffectID>>();
  effects = new Map<EffectID, () => void>();

  constructor() {}
  createSignal<T>(value: T): Signal<T> {
    const signalId = Symbol();
    this.signalValues.set(signalId, value);
    return new Signal(this, signalId);
  }
  createEffect(effect: () => void) {
    const effectId = Symbol();
    this.effects.set(effectId, effect);

    this.runEffect(effectId);
  }
  runEffect(effectId: EffectID) {
    const prevEffectId = this.runningEffectId;
    this.runningEffectId = effectId;
    this.effects.get(effectId)?.();
    this.runningEffectId = prevEffectId;
  }
}
