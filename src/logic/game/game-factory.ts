import { FinishData, Game, Round } from "./game";
import { LetterPicker } from "../letter-picker";
import { Randomizer } from "../randomizer";
import { MAX_WORDS_IN_QUEUE, WordPicker } from "../word-picker";
import { GameStore } from "./game-store";

export function gameFactory(options: {
  restore: boolean;
  listeners: {
    onSurrender: (next: () => void) => void;
    onFinish: (data: FinishData) => void;
  };
}): Game {
  const game = new Game(options.listeners);

  if (options.restore) {
    GameStore.restore(game);
  } else {
    WordPicker.pickRandomWords(MAX_WORDS_IN_QUEUE).forEach((word) => {
      const randomizer = new Randomizer();
      const letterPicker = new LetterPicker(randomizer);
      const randomWordLetters = letterPicker.randomize(word);

      const round = new Round(game, word, randomWordLetters);
      game.addRound(round);
    });
  }
  return game;
}
