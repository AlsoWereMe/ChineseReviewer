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

const SESSION_SIZE = 20;

/** Up to 20 questions, or the whole pool if smaller. Excludes already-seen IDs. */
export function pickSessionQuestions(
  pool: Question[],
  seenIds: string[] = [],
): Question[] {
  if (pool.length === 0) return [];

  let available = pool;
  if (seenIds.length > 0) {
    const seenSet = new Set(seenIds);
    available = pool.filter((q) => !seenSet.has(q.id));
    if (available.length === 0) available = pool;
  }

  const shuffled = shuffle(available);
  return shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length));
}

export function letterToIndex(letter: AnswerLetter): number {
  return LETTERS.indexOf(letter);
}

export function isAnswerLetter(s: string): s is AnswerLetter {
  return s === "A" || s === "B" || s === "C" || s === "D";
}
