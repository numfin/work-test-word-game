import { Randomizer } from "./randomizer";

export const WORD_VARIANTS = [
  "apple",
  "function",
  "timeout",
  "task",
  "application",
  "data",
  "tragedy",
  "sun",
  "symbol",
  "button",
  "software",
];
export const MAX_WORDS_IN_QUEUE = 6;

export class WordPicker {
  constructor(private randomizer: Randomizer, private words: string[]) {}

  getRandomWords(amount: number) {
    const pickedIndexes = new Set();
    const chosenWords = [];
    for (const _ of Array(amount).keys()) {
      const freshSet = this.words
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !pickedIndexes.has(index));
      const { index, item } = this.randomizer.pick(freshSet);
      pickedIndexes.add(index);
      chosenWords.push(item);
    }
    return chosenWords;
  }

  static pickRandomWords(amount: number) {
    const randomizer = new Randomizer();
    const wordPicker = new WordPicker(randomizer, WORD_VARIANTS);
    const wordCollection = wordPicker.getRandomWords(amount);
    return wordCollection;
  }
}
