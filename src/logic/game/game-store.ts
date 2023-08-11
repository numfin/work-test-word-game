import { Game, Round } from "./game";

const KEY = "gamestate-numfin";

interface GameState {
  currentRoundIndex: number;
  rounds: {
    word: string;
    currentErrors: number;
    pickedIndexes: number[];
    surrender: boolean;
    randomWordLetters: string[];
  }[];
}

export class GameStore {
  constructor() {}

  static checkSaveAndAsk() {
    try {
      const parsedData = JSON.parse(localStorage.getItem(KEY) ?? "");
      return (
        typeof parsedData["currentRoundIndex"] === "number" &&
        confirm("Restore last session?")
      );
    } catch (_) {
      return false;
    }
  }

  static save(game: Game) {
    const gameState = {
      currentRoundIndex: game.currentRoundIndex,
      rounds: game.rounds.map((r) => ({
        word: r.word,
        currentErrors: r.currentErrors,
        pickedIndexes: Array.from(r.pickedIndexes.values()),
        surrender: r.surrender,
        randomWordLetters: r.randomWordLetters,
      })),
    };
    localStorage.setItem(KEY, JSON.stringify(gameState));
  }
  /** Mutate game state */
  static restore(game: Game) {
    const gameState: GameState = JSON.parse(localStorage.getItem(KEY) ?? "");
    for (const savedRound of gameState.rounds) {
      const newRound = new Round(
        game,
        savedRound.word,
        savedRound.randomWordLetters,
        savedRound.currentErrors
      );
      savedRound.pickedIndexes.forEach((index) =>
        newRound.pickedIndexes.add(index)
      );
      newRound.surrender = savedRound.surrender;
      game.addRound(newRound);
    }
    game.currentRoundIndex = gameState.currentRoundIndex;
    if (game.currentRound().surrender) {
      game.nextRound();
    }
  }
}
