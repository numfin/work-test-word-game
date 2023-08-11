import { Runtime } from "./reactivity";

export type EM = HTMLElementEventMap;
export type TM = HTMLElementTagNameMap;

interface EventHandler<EventName extends keyof EM> {
  (event: EM[EventName]): void;
}

export class El {
  private constructor(public htmlEl: HTMLElement) {}
  static new<T extends keyof TM>(tagName: T) {
    const el = document.createElement(tagName);
    return new El(el);
  }
  /** Static attribute bind */
  attr(attrName: string, attrValue: string) {
    this.htmlEl.setAttribute(attrName, attrValue);

    return this;
  }
  /** Reactive attribute bind */
  attrDyn(cx: Runtime, attrName: string, attrValue: () => string | boolean) {
    cx.createEffect(() => {
      this.htmlEl.removeAttribute(attrName);
      const value = attrValue();
      if (typeof value === "boolean") {
        if (value) {
          this.htmlEl.setAttribute(attrName, "true");
        } else {
          this.htmlEl.removeAttribute(attrName);
        }
      } else {
        this.htmlEl.setAttribute(attrName, value);
      }
    });

    return this;
  }
  /** addEventListener */
  on<T extends keyof EM>(eventName: T, cb: EventHandler<T>) {
    this.htmlEl.addEventListener(eventName, cb);
    return this;
  }
  /** Static render for text */
  text(data: string) {
    const node = document.createTextNode(data);
    this.htmlEl.appendChild(node);
    return this;
  }
  /** Reactive render for text */
  textDyn(cx: Runtime, f: () => string) {
    const node = document.createTextNode("");
    this.htmlEl.appendChild(node);

    cx.createEffect(() => {
      node.textContent = f();
    });

    return this;
  }
  /** Render for child component */
  child(child: El) {
    this.htmlEl.appendChild(child.htmlEl);
    return this;
  }
  /** Static render for iterators */
  iter<T>(itemsIter: Iterable<T>, mapper: (item: T) => El): El {
    for (const item of itemsIter) {
      const el = mapper(item);
      this.htmlEl.appendChild(el.htmlEl);
    }

    return this;
  }
  /** Reactive render for iterators */
  iterDyn<T>(
    cx: Runtime,
    itemsIter: () => Iterable<T>,
    mapper: (item: T, index: number) => El
  ): El {
    const disposers: (() => void)[] = [];
    const iterEnd = document.createComment("iter end");
    this.htmlEl.appendChild(iterEnd);

    cx.createEffect(() => {
      for (const disposer of disposers) {
        disposer();
      }
      let index = 0;
      for (const item of itemsIter()) {
        const el = mapper(item, index++);
        this.htmlEl.insertBefore(el.htmlEl, iterEnd);
        disposers.push(() => el.htmlEl.remove());
      }
    });

    return this;
  }
}
