import type { AnswerLetter } from "../data/types";
import type { ModuleId } from "../config/modules";

const STORAGE_KEY = "chinese-reviewer-mistakes-v1";

export interface MistakeRecord {
  id: string;
  module: ModuleId;
  question: string;
  options: [string, string, string, string];
  correct_answer: AnswerLetter;
  user_answer: AnswerLetter;
  description: string;
  savedAt: number;
}

function readRaw(): unknown {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return [];
    return JSON.parse(s) as unknown;
  } catch {
    return [];
  }
}

export function loadMistakes(): MistakeRecord[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) return [];
  return raw.filter(isMistakeRecord);
}

function isMistakeRecord(x: unknown): x is MistakeRecord {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.module === "string" &&
    typeof o.question === "string" &&
    Array.isArray(o.options) &&
    o.options.length === 4 &&
    typeof o.correct_answer === "string" &&
    typeof o.user_answer === "string" &&
    typeof o.description === "string" &&
    typeof o.savedAt === "number"
  );
}

export function saveMistake(record: Omit<MistakeRecord, "savedAt">): void {
  const full: MistakeRecord = { ...record, savedAt: Date.now() };
  const list = loadMistakes();
  const idx = list.findIndex(
    (m) => m.module === full.module && m.id === full.id,
  );
  if (idx >= 0) list[idx] = full;
  else list.unshift(full);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function clearMistakes(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function mistakesForModule(module: ModuleId | "all"): MistakeRecord[] {
  const all = loadMistakes();
  if (module === "all") return all;
  return all.filter((m) => m.module === module);
}
