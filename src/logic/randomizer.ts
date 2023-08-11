export class Randomizer {
  pick<T>(collection: T[]) {
    const index = Math.floor(Math.random() * collection.length);
    return collection[index];
  }
}
