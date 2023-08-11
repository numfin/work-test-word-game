import { AnswerPanel } from "./ui/answer-panel";
import { mount } from "./renderer/mount";
import { Runtime } from "./renderer/reactivity";
import { LetterPanel } from "./ui/letter-panel";
import { gameFactory } from "./logic/game/game-factory";
import { GameStore } from "./logic/game/game-store";
import { El } from "./renderer/el";

function main() {
  const cx = new Runtime();

  const gameInner = gameFactory({
    restore: GameStore.checkSaveAndAsk(),
    listeners: {
      onFinish(data) {
        alert(JSON.stringify(data));
      },
      onSurrender(next) {
        setTimeout(() => {
          next();
          // trigger update, since Game doesn't know anything about reactivity
          game.update((g) => g);
        }, 2000);
      },
    },
  });
  const game = cx.createSignal(gameInner);

  cx.createEffect(() => {
    GameStore.save(game.get());
  });

  mount(document.querySelector("#answer")!, AnswerPanel(cx, { game }));
  mount(document.querySelector("#letters")!, LetterPanel(cx, { game }));

  mount(
    document.querySelector("#current_question")!,
    El.new("span").textDyn(cx, () =>
      (game.get().currentRoundIndex + 1).toString()
    )
  );
  mount(
    document.querySelector("#total_questions")!,
    El.new("span").textDyn(cx, () => game.get().rounds.length.toString())
  );
}

main();
