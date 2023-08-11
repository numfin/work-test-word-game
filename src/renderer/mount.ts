import { El } from "./el";

export function mount(root: HTMLElement, el: El) {
  root.appendChild(el.htmlEl);
}
