import { Game } from "../logic/game/game";
import { createComponent } from "../renderer/component";
import { El } from "../renderer/el";
import { Signal } from "../renderer/reactivity";
import { LetterBtn } from "./letter-btn";

interface AnswerPanelProps {
  game: Signal<Game>;
}

export const AnswerPanel = createComponent((cx, { game }: AnswerPanelProps) => {
  const round = () => game.get().currentRound();
  return El.new("div")
    .attr("class", "d-flex justify-content-center")
    .attr("style", "gap: 0.5em")
    .iterDyn(
      cx,
      () => {
        const r = round();
        if (!r) {
          return [];
        }
        if (r.abandoned) {
          return r.word.split("");
        }
        return r.word.slice(0, r.pickedIndexes.size).split("");
      },
      (letter) => {
        return LetterBtn(cx, {
          letter,
          isInvalid: () => !!round()?.abandoned,
          pick: () => {},
        });
      }
    );
});
