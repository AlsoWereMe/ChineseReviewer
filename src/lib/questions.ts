import type { AnswerLetter, Question } from "../data/types";

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];

export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Pick a random subset from the pool with an upper bound. */
export function pickRandomQuestions(pool: Question[], count: number): Question[] {
  if (pool.length === 0) return [];
  const safeCount = Math.max(1, count);
  return shuffle(pool).slice(0, Math.min(safeCount, pool.length));
}

export function letterToIndex(letter: AnswerLetter): number {
  return LETTERS.indexOf(letter);
}

export function isAnswerLetter(s: string): s is AnswerLetter {
  return s === "A" || s === "B" || s === "C" || s === "D";
}
