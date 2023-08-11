import { El } from "./el";
import { Runtime } from "./reactivity";

export function createComponent<T>(fn: (cx: Runtime, props: T) => El) {
  return fn;
}
