import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { isModuleId, MODULE_LABELS } from "../config/modules";
import { getQuestionsForModule } from "../data/loadQuestions";
import type { AnswerLetter, Question } from "../data/types";
import { pickRandomQuestions } from "../lib/questions";
import { saveMistake } from "../lib/mistakes";
import { clearAllReviewProgress } from "../lib/reviewProgress";

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];
const MIN_RANDOM_COUNT = 10;
const MAX_RANDOM_COUNT = 30;
const DEFAULT_RANDOM_COUNT = 20;

type Phase = "quiz" | "summary";
type ReviewMode = "random" | "sequential";

function parseRandomCount(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isInteger(parsed)) return DEFAULT_RANDOM_COUNT;
  return Math.max(MIN_RANDOM_COUNT, Math.min(MAX_RANDOM_COUNT, parsed));
}

export function Review() {
  const { moduleId: rawId } = useParams<{ moduleId: string }>();
  const [searchParams] = useSearchParams();

  const moduleId = rawId && isModuleId(rawId) ? rawId : null;
  const label = moduleId ? MODULE_LABELS[moduleId] : "";
  const mode: ReviewMode = searchParams.get("mode") === "sequential" ? "sequential" : "random";
  const randomCount = parseRandomCount(searchParams.get("count"));

  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<AnswerLetter | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [modeNotice, setModeNotice] = useState<string | null>(null);
  const [jumpInput, setJumpInput] = useState("");
  const [jumpError, setJumpError] = useState<string | null>(null);

  const modeText = useMemo(() => {
    if (mode === "sequential") return "顺序浏览";
    return `随机复习（${randomCount}题）`;
  }, [mode, randomCount]);

  const startSession = useCallback(() => {
    if (!moduleId) return;
    const pool = getQuestionsForModule(moduleId);

    const questions =
      mode === "sequential" ? pool : pickRandomQuestions(pool, Math.min(randomCount, pool.length));

    let notice: string | null = null;
    if (mode === "random" && pool.length < randomCount) {
      notice = `当前模块共有 ${pool.length} 题，已按全部题目开始随机复习。`;
    }
    setSessionQuestions(questions);
    setIndex(0);
    setPhase("quiz");
    setAnswered(false);
    setSelected(null);
    setCorrectCount(0);
    setWrongIds([]);
    setJumpInput("");
    setJumpError(null);
    setModeNotice(notice);
  }, [moduleId, mode, randomCount]);

  useEffect(() => {
    clearAllReviewProgress();
  }, []);

  useEffect(() => {
    return () => {
      clearAllReviewProgress();
    };
  }, []);

  useEffect(() => {
    if (!moduleId) {
      clearAllReviewProgress();
      setSessionQuestions([]);
      return;
    }
    startSession();
  }, [moduleId, startSession]);

  const current = sessionQuestions[index];
  const total = sessionQuestions.length;
  const isLast = index >= total - 1;
  const progressPct = total === 0 ? 0 : Math.round(((index + 1) / total) * 100);

  useEffect(() => {
    if (!moduleId || phase !== "quiz") return;
    if (current) return;
    if (getQuestionsForModule(moduleId).length === 0) return;
    startSession();
  }, [moduleId, phase, current, startSession]);

  const handlePick = useCallback(
    (letter: AnswerLetter) => {
      if (!moduleId || !current || answered) return;
      setSelected(letter);
      setAnswered(true);
      const ok = letter === current.correct_answer;
      if (ok) setCorrectCount((c) => c + 1);
      else {
        setWrongIds((w) => [...w, current.id]);
        saveMistake({
          id: current.id,
          module: moduleId,
          question: current.question,
          options: current.options,
          correct_answer: current.correct_answer,
          user_answer: letter,
          description: current.description,
        });
      }
    },
    [answered, current, moduleId],
  );

  const handleNext = useCallback(() => {
    if (!answered) return;
    if (isLast) {
      setPhase("summary");
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setSelected(null);
  }, [answered, isLast]);

  const handleJumpToQuestion = useCallback(() => {
    if (mode !== "sequential") return;
    const keyword = jumpInput.trim();
    if (!keyword) {
      setJumpError("请输入题号或顺序号。");
      return;
    }

    const byId = sessionQuestions.findIndex((q) => q.id.toLowerCase() === keyword.toLowerCase());
    let targetIndex = byId;
    if (targetIndex < 0 && /^\d+$/.test(keyword)) {
      const n = Number.parseInt(keyword, 10);
      if (Number.isInteger(n)) targetIndex = n - 1;
    }

    if (targetIndex < 0 || targetIndex >= sessionQuestions.length) {
      setJumpError("未找到对应题目，请检查输入后重试。");
      return;
    }

    setIndex(targetIndex);
    setAnswered(false);
    setSelected(null);
    setJumpError(null);
  }, [jumpInput, mode, sessionQuestions]);


  if (!moduleId) {
    return (
      <div className="state-card card page-narrow">
        <h1 className="page-title">无效模块</h1>
        <p className="page-lead">链接中的模块参数不存在。</p>
        <Link to="/" className="button-ghost">
          返回首页
        </Link>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="state-card card page-narrow">
        <h1 className="page-title">{label}</h1>
        <p className="page-lead">
          本题库暂无题目，请在 <code>src/data/modules/</code> 中补充 JSON 数据。
        </p>
        <Link to="/" className="button-ghost">
          返回首页
        </Link>
      </div>
    );
  }

  if (phase === "summary") {
    const wrong = total - correctCount;
    const accuracy = Math.round((correctCount / total) * 100);

    return (
      <div className="summary card page-narrow">
        <p className="eyebrow">练习完成</p>
        <h1 className="page-title">{label}</h1>
        <p className="page-lead">学习模式：{modeText}</p>

        <div className="summary-metrics">
          <article className="metric-card">
            <span>正确</span>
            <strong className="text-correct">{correctCount}</strong>
          </article>
          <article className="metric-card">
            <span>错误</span>
            <strong className="text-wrong">{wrong}</strong>
          </article>
          <article className="metric-card">
            <span>正确率</span>
            <strong>{accuracy}%</strong>
          </article>
        </div>

        {wrongIds.length > 0 && (
          <section className="summary-wrong">
            <h2>错题编号</h2>
            <div className="chip-wrap">
              {wrongIds.map((id) => (
                <span className="chip" key={id}>
                  {id}
                </span>
              ))}
            </div>
            <p className="hint">可在「错题」页查看详细内容与解析。</p>
          </section>
        )}

        <div className="summary-actions">
          <Link to="/" className="button-primary">
            重新选择模式
          </Link>
          <Link to="/" className="button-ghost">
            返回主页
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="review card">
      {modeNotice && <p className="hint">{modeNotice}</p>}
      <div className="review-head">
        <p className="review-meta">
          {label} · {modeText} · 第 {index + 1} / {total} 题
        </p>
        <p className="review-percent">{progressPct}%</p>
      </div>
      <p className="review-question-id">数据库题号：{current.id}</p>

      {mode === "sequential" && (
        <div className="jump-panel">
          <label htmlFor="jump-input" className="bank-search-label">
            跳到题号（支持数据库题号或顺序号）
          </label>
          <div className="mode-random-row">
            <input
              id="jump-input"
              className="mode-input"
              type="text"
              value={jumpInput}
              onChange={(e) => {
                setJumpInput(e.target.value);
                setJumpError(null);
              }}
              placeholder="例如 LIT-001 或 12"
            />
            <button type="button" className="button-ghost" onClick={handleJumpToQuestion}>
              跳转
            </button>
          </div>
          {jumpError && <p className="text-wrong">{jumpError}</p>}
        </div>
      )}
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${progressPct}%` }} />
      </div>

      <h1 className="question-text">{current.question}</h1>

      <div className="choices" role="group" aria-label="选项">
        {LETTERS.map((letter, i) => {
          const isSelected = selected === letter;
          const isCorrect = letter === current.correct_answer;
          let cls = "choice";

          if (answered) {
            if (isCorrect) cls += " choice--correct";
            else if (isSelected && !isCorrect) cls += " choice--wrong";
            else cls += " choice--dim";
          }

          return (
            <button
              key={letter}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => handlePick(letter)}
            >
              <span className="choice-letter">{letter}</span>
              <span className="choice-text">{current.options[i]}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <p className="feedback" role="status">
            {selected === current.correct_answer ? (
              <span className="text-correct stamp-seal">回答正确</span>
            ) : (
              <span className="text-wrong">回答错误 · 正确答案：{current.correct_answer}</span>
            )}
          </p>

          <div className="description-box">
            <h2 className="description-title">题目解析</h2>
            <p>{current.description}</p>
          </div>

          <button type="button" className="button-primary" onClick={handleNext}>
            {isLast ? "查看总结" : "下一题"}
          </button>
        </>
      )}
    </div>
  );
}
