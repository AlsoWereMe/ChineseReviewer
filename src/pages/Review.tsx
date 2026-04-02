import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isModuleId, MODULE_LABELS } from "../config/modules";
import { getQuestionsForModule } from "../data/loadQuestions";
import type { AnswerLetter, Question } from "../data/types";
import { pickSessionQuestions } from "../lib/questions";
import { saveMistake } from "../lib/mistakes";
import {
  clearAllReviewProgress,
  clearDraftProgress,
  clearSavedProgress,
  loadSavedProgress,
  saveDraftProgress,
} from "../lib/reviewProgress";

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];

type Phase = "quiz" | "summary";

export function Review() {
  const { moduleId: rawId } = useParams<{ moduleId: string }>();

  const moduleId = rawId && isModuleId(rawId) ? rawId : null;
  const label = moduleId ? MODULE_LABELS[moduleId] : "";

  const defaultQuestions = useMemo(() => {
    if (!moduleId) return [] as Question[];
    return pickSessionQuestions(getQuestionsForModule(moduleId));
  }, [moduleId]);

  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<AnswerLetter | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  useEffect(() => {
    if (!moduleId) {
      clearAllReviewProgress();
      setSessionQuestions([]);
      return;
    }
    const saved = loadSavedProgress();
    if (saved && saved.moduleId === moduleId) {
      setSessionQuestions(saved.sessionQuestions);
      setIndex(saved.index);
      setPhase(saved.phase);
      setAnswered(saved.answered);
      setSelected(saved.selected);
      setCorrectCount(saved.correctCount);
      setWrongIds(saved.wrongIds);
      return;
    }
    setSessionQuestions(defaultQuestions);
    setIndex(0);
    setPhase("quiz");
    setAnswered(false);
    setSelected(null);
    setCorrectCount(0);
    setWrongIds([]);
    clearDraftProgress();
  }, [moduleId, defaultQuestions]);

  useEffect(() => {
    if (!moduleId) return;
    if (phase === "summary") {
      clearDraftProgress();
      clearSavedProgress();
      return;
    }
    if (sessionQuestions.length === 0) return;
    saveDraftProgress({
      moduleId,
      sessionQuestions,
      index,
      phase,
      answered,
      selected,
      correctCount,
      wrongIds,
    });
  }, [moduleId, sessionQuestions, index, phase, answered, selected, correctCount, wrongIds]);

  const current = sessionQuestions[index];
  const total = sessionQuestions.length;
  const isLast = index >= total - 1;
  const progressPct = total === 0 ? 0 : Math.round(((index + 1) / total) * 100);

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
      clearDraftProgress();
      clearSavedProgress();
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setSelected(null);
  }, [answered, isLast]);

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
          <Link to={`/review/${moduleId}`} className="button-primary">
            再练一次
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
      <div className="review-head">
        <p className="review-meta">
          {label} · 第 {index + 1} / {total} 题
        </p>
        <p className="review-percent">{progressPct}%</p>
      </div>
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
