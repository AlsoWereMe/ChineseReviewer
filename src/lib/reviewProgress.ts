import type { ModuleId } from "../config/modules";
import { isModuleId } from "../config/modules";
import type { AnswerLetter, Question } from "../data/types";
import { isAnswerLetter } from "./questions";

const DRAFT_KEY = "chinese-reviewer-review-draft-v1";
const SAVED_KEY = "chinese-reviewer-review-saved-v1";

export interface ReviewProgress {
  moduleId: ModuleId;
  sessionQuestions: Question[];
  index: number;
  phase: "quiz" | "summary";
  answered: boolean;
  selected: AnswerLetter | null;
  correctCount: number;
  wrongIds: string[];
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isReviewProgress(x: unknown): x is ReviewProgress {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.moduleId !== "string" || !isModuleId(o.moduleId)) return false;
  if (!Array.isArray(o.sessionQuestions)) return false;
  if (typeof o.index !== "number") return false;
  if (o.phase !== "quiz" && o.phase !== "summary") return false;
  if (typeof o.answered !== "boolean") return false;
  if (o.selected !== null && (typeof o.selected !== "string" || !isAnswerLetter(o.selected))) {
    return false;
  }
  if (typeof o.correctCount !== "number") return false;
  if (!Array.isArray(o.wrongIds)) return false;
  return true;
}

export function loadDraftProgress(): ReviewProgress | null {
  const raw = readJson(DRAFT_KEY);
  return isReviewProgress(raw) ? raw : null;
}

export function saveDraftProgress(progress: ReviewProgress): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(progress));
}

export function clearDraftProgress(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function loadSavedProgress(): ReviewProgress | null {
  const raw = readJson(SAVED_KEY);
  return isReviewProgress(raw) ? raw : null;
}

export function saveSavedProgress(progress: ReviewProgress): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(progress));
}

export function clearSavedProgress(): void {
  localStorage.removeItem(SAVED_KEY);
}

export function saveDraftToSaved(): void {
  const draft = loadDraftProgress();
  if (!draft) return;
  saveSavedProgress(draft);
  clearDraftProgress();
}

export function clearAllReviewProgress(): void {
  clearDraftProgress();
  clearSavedProgress();
}
