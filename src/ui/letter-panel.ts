import { Game } from "../logic/game/game";
import { createComponent } from "../renderer/component";
import { El } from "../renderer/el";
import { Signal } from "../renderer/reactivity";
import { LetterBtn } from "./letter-btn";

interface LetterPanelProps {
  game: Signal<Game>;
}
export const LetterPanel = createComponent((cx, { game }: LetterPanelProps) => {
  window.addEventListener("keydown", (e) => {
    const char = e.code.slice(3).toLowerCase();
    const invalidIndexesInner = invalidIndexes.get();
    const round = game.get().currentRound();
    const found = round.visibleRandomLetters().find(({ letter, index }) => {
      const notInvalid = !invalidIndexesInner.has(index);
      return notInvalid && char === letter;
    });
    if (found) {
      pick(found.index);
    }
  });

  function pick(index: number) {
    const isValid = game.get().guess(index);
    game.set(game.get());

    if (!isValid) {
      triggerInvalidIndex(index);
    }
  }

  const invalidIndexes = cx.createSignal(new Set<number>());
  function triggerInvalidIndex(index: number) {
    invalidIndexes.update((ii) => {
      ii.add(index);
      return ii;
    });
    setTimeout(() => {
      invalidIndexes.update((ii) => {
        ii.delete(index);
        return ii;
      });
    }, 200);
  }

  return El.new("div")
    .attr("class", "d-flex justify-content-center")
    .attr("style", "gap: 0.5em")
    .iterDyn(
      cx,
      () => game.get().currentRound()?.visibleRandomLetters() ?? [],
      ({ letter, index }) =>
        LetterBtn(cx, {
          letter,
          isInvalid: () => invalidIndexes.get().has(index),
          pick: () => pick(index),
        })
    );
});
