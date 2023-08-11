import { createComponent } from "../renderer/component";
import { El } from "../renderer/el";

interface LetterBtnProps {
  pick?: () => void;
  isInvalid?: () => boolean;
  letter: string;
}
export const LetterBtn = createComponent((cx, props: LetterBtnProps) => {
  return El.new("button")
    .on("click", () => props.pick?.())
    .attr("type", "button")
    .attrDyn(cx, "class", () =>
      props.isInvalid?.() ? `btn btn-danger` : `btn btn-primary`
    )
    .attr("style", "width: 2.5em; height: 2.5em")
    .text(props.letter);
});
