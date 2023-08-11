import { Randomizer } from "./randomizer";

export class LetterPicker {
  constructor(private randomizer: Randomizer) {}

  randomize(word: string) {
    const letters = word.split("");
    const pickedIndexes = new Set();

    return letters.map(() => {
      const freshSet = letters
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !pickedIndexes.has(index));
      const { item, index } = this.randomizer.pick(freshSet);
      pickedIndexes.add(index);
      return item;
    });
  }
}
