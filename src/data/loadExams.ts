import type { Question } from "./types";
import { isAnswerLetter } from "../lib/questions";

const REQUIRED_QUESTION_COUNT = 20;

export interface ExamPaperMeta {
  id: string;
  title: string;
  questionCount: number;
  error: string | null;
}

interface ExamPaperRecord {
  meta: ExamPaperMeta;
  questions: Question[] | null;
}

function buildTitleFromId(id: string): string {
  const normalized = id.replace(/[-_]+/g, " ").trim();
  return normalized ? `试卷：${normalized}` : `试卷：${id}`;
}

function isQuestion(value: unknown): value is Question {
  if (value === null || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.module === "string" &&
    typeof row.question === "string" &&
    Array.isArray(row.options) &&
    row.options.length === 4 &&
    row.options.every((opt) => typeof opt === "string") &&
    typeof row.correct_answer === "string" &&
    isAnswerLetter(row.correct_answer) &&
    typeof row.description === "string"
  );
}

function parsePaperId(path: string): string {
  const matched = path.match(/\/([^/]+)\.json$/);
  return matched?.[1] ?? path;
}

function validatePaper(raw: unknown): { questions: Question[] | null; error: string | null } {
  if (!Array.isArray(raw)) {
    return { questions: null, error: "题库文件格式错误：顶层必须是数组。"};
  }
  if (raw.length !== REQUIRED_QUESTION_COUNT) {
    return { questions: null, error: `题量必须为 ${REQUIRED_QUESTION_COUNT} 题。` };
  }
  const parsed = raw.filter(isQuestion);
  if (parsed.length !== raw.length) {
    return { questions: null, error: "题目格式错误：每题必须是四选一并包含答案与解析。"};
  }
  return { questions: parsed, error: null };
}

const RAW_EXAMS = import.meta.glob("./exams/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const PAPER_RECORDS: ExamPaperRecord[] = Object.entries(RAW_EXAMS)
  .map(([path, payload]) => {
    const id = parsePaperId(path);
    const checked = validatePaper(payload);
    return {
      meta: {
        id,
        title: buildTitleFromId(id),
        questionCount: Array.isArray(payload) ? payload.length : 0,
        error: checked.error,
      },
      questions: checked.questions,
    };
  })
  .sort((a, b) => a.meta.id.localeCompare(b.meta.id, "zh-CN"));

export function getExamPapers(): ExamPaperMeta[] {
  return PAPER_RECORDS.map((record) => record.meta);
}

export function getExamPaperById(paperId: string): Question[] | null {
  const hit = PAPER_RECORDS.find((record) => record.meta.id === paperId);
  return hit?.questions ?? null;
}

export function getExamPaperMeta(paperId: string): ExamPaperMeta | null {
  return PAPER_RECORDS.find((record) => record.meta.id === paperId)?.meta ?? null;
}
