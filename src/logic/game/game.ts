const MAX_ROUND_ERRORS = 3;

export class Round {
  private maxErrors = MAX_ROUND_ERRORS;
  public pickedIndexes = new Set<number>();
  public surrender = false;

  constructor(
    private game: Game,
    public word: string,
    public randomWordLetters: string[],
    public currentErrors = 0
  ) {}

  visibleRandomLetters() {
    return this.randomWordLetters
      .map((letter, index) => ({ letter, index }))
      .filter(({ index }) => !this.pickedIndexes.has(index));
  }
  guess(randomLetterIndex: number) {
    if (this.surrender) {
      return;
    }
    const guessedLetter = this.randomWordLetters[randomLetterIndex];
    const currentLetter = this.word[this.pickedIndexes.size];
    const guessedRight = guessedLetter === currentLetter;
    if (guessedRight) {
      this.acceptLetter(randomLetterIndex);
    } else {
      this.triggerMistake();
    }
    return guessedRight;
  }

  private acceptLetter(randomLetterIndex: number) {
    this.pickedIndexes.add(randomLetterIndex);
    if (this.pickedIndexes.size >= this.word.length) {
      this.game.nextRound();
    }
  }
  private triggerMistake() {
    this.currentErrors += 1;
    if (this.currentErrors >= this.maxErrors) {
      this.surrender = true;
      this.game.surrender();
    }
  }
}

export interface FinishData {
  correctRounds: number;
  errorAmount: number;
  worstWord: string;
}
export class Game {
  public rounds: Round[] = [];

  constructor(
    private listeners: {
      onSurrender: (next: () => void) => void;
      onFinish: (data: FinishData) => void;
    },
    public currentRoundIndex = 0
  ) {}
  get info(): FinishData {
    const correctRounds = this.rounds.filter((r) => r.currentErrors === 0);
    const errorAmount = this.rounds.reduce((sum, r) => {
      return sum + r.currentErrors;
    }, 0);
    const sortedByErrorsDesc = this.rounds
      .filter((r) => r.currentErrors > 0)
      .sort((a, b) => b.currentErrors - a.currentErrors);
    const worstWord = sortedByErrorsDesc[0]?.word ?? "";

    return {
      correctRounds: correctRounds.length,
      errorAmount,
      worstWord,
    };
  }

  addRound(round: Round) {
    this.rounds.push(round);
  }
  currentRound() {
    return this.rounds[this.currentRoundIndex];
  }
  guess(randomLetterIndex: number) {
    return this.currentRound()?.guess(randomLetterIndex);
  }
  surrender() {
    this.listeners.onSurrender(() => this.nextRound());
  }
  nextRound() {
    const nextRound = this.currentRoundIndex + 1;
    if (nextRound >= this.rounds.length) {
      this.listeners.onFinish(this.info);
    } else {
      this.currentRoundIndex = nextRound;
    }
  }
}
