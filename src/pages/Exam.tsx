import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AnswerLetter } from "../data/types";
import { getExamPaperById, getExamPaperMeta } from "../data/loadExams";
import { useConfirm } from "../components/ConfirmProvider";

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];

type Phase = "exam" | "result";

function getOptionTextByLetter(
  options: [string, string, string, string],
  letter: AnswerLetter,
): string {
  const idx = LETTERS.indexOf(letter);
  return idx >= 0 ? options[idx] : "";
}

export function Exam() {
  const { paperId = "" } = useParams<{ paperId: string }>();
  const confirm = useConfirm();
  const meta = getExamPaperMeta(paperId);
  const questions = getExamPaperById(paperId);
  const [phase, setPhase] = useState<Phase>("exam");
  const [index, setIndex] = useState(0);
  const [answersByIndex, setAnswersByIndex] = useState<(AnswerLetter | null)[]>(
    () => new Array(questions?.length ?? 0).fill(null),
  );
  
  useEffect(() => {
    setPhase("exam");
    setIndex(0);
    setAnswersByIndex(new Array(questions?.length ?? 0).fill(null));
  }, [paperId, questions?.length]);

  const total = questions?.length ?? 0;
  const current = questions?.[index];

  const isCurrentAnswered = answersByIndex[index] !== null;
  const answeredCount = answersByIndex.filter(Boolean).length;
  const canSubmit = total > 0 && answeredCount === total;
  const unansweredNumbers = useMemo(() => {
    return answersByIndex
      .map((answer, idx) => (answer ? null : idx + 1))
      .filter((n): n is number => n !== null);
  }, [answersByIndex]);

  const result = useMemo(() => {
    if (!questions) return null;
    const rows = questions.map((q, idx) => {
      const userAnswer = answersByIndex[idx];
      const isCorrect = userAnswer === q.correct_answer;
      return { question: q, userAnswer, isCorrect };
    });
    const correctCount = rows.filter((r) => r.isCorrect).length;
    const wrongRows = rows.filter((r) => !r.isCorrect);
    const score = Math.round((correctCount / questions.length) * 100);
    return { rows, wrongRows, correctCount, score };
  }, [answersByIndex, questions]);

  function pickAnswer(letter: AnswerLetter) {
    if (!questions || phase !== "exam") return;
    setAnswersByIndex((prev) => {
      const next = [...prev];
      next[index] = letter;
      return next;
    });
  }

  function jumpTo(targetIndex: number) {
    if (!questions || phase !== "exam") return;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    setIndex(targetIndex);
  }

  async function handleSubmit() {
    if (phase !== "exam") return;
    if (canSubmit) {
      setPhase("result");
      return;
    }
    const numbersText = unansweredNumbers.join("、");
    await confirm({
      title: "还有题目未完成",
      message: `请先完成以下题号后再提交：${numbersText}`,
      cancelText: "继续作答",
      confirmText: "我知道了",
    });
  }

  if (!meta) {
    return (
      <div className="state-card card page-narrow">
        <h1 className="page-title">试卷不存在</h1>
        <p className="page-lead">未找到对应的试卷编号，请返回考试列表重新选择。</p>
        <Link to="/exams" className="button-ghost">
          返回考试列表
        </Link>
      </div>
    );
  }

  if (meta.error || !questions || total === 0) {
    return (
      <div className="state-card card page-narrow">
        <h1 className="page-title">{meta.title}</h1>
        <p className="text-wrong">{meta.error ?? "试卷数据不可用。"}</p>
        <Link to="/exams" className="button-ghost">
          返回考试列表
        </Link>
      </div>
    );
  }

  if (phase === "result" && result) {
    const wrongCount = total - result.correctCount;
    return (
      <div className="exam-result-page">
        <section className="card summary page-narrow">
          <p className="eyebrow">考试完成</p>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-lead">本次作答共 {total} 题</p>
          <div className="summary-metrics">
            <article className="metric-card">
              <span>分数</span>
              <strong>{result.score}</strong>
            </article>
            <article className="metric-card">
              <span>正确</span>
              <strong className="text-correct">{result.correctCount}</strong>
            </article>
            <article className="metric-card">
              <span>错误</span>
              <strong className="text-wrong">{wrongCount}</strong>
            </article>
          </div>
        </section>

        <section className="card exam-analysis">
          <h2 className="description-title">错题分析</h2>
          {result.wrongRows.length === 0 ? (
            <p className="text-correct">本次考试全部答对，表现很好。</p>
          ) : (
            <ul className="exam-analysis-list" role="list">
              {result.wrongRows.map((row) => (
                <li key={row.question.id} className="exam-analysis-item">
                  <p className="mistake-question">
                    <span className="question-code">[{row.question.id}]</span>
                    {row.question.question}
                  </p>
                  <p className="mistake-answers">
                    你的答案：
                    <span className="answer-badge answer-badge--wrong">{row.userAnswer ?? "-"}</span>
                    {row.userAnswer ? `（${getOptionTextByLetter(row.question.options, row.userAnswer)}）` : ""}
                    {" · "}
                    正确答案：
                    <span className="answer-badge answer-badge--correct">{row.question.correct_answer}</span>
                    {`（${getOptionTextByLetter(row.question.options, row.question.correct_answer)}）`}
                  </p>
                  <p className="bank-description">{row.question.description}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="summary-actions">
            <Link to="/exams" className="button-primary">
              再考一套
            </Link>
            <Link to="/" className="button-ghost">
              返回主页
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="exam-page card">
      <div className="review-head">
        <p className="review-meta">
          {meta.title} · 第 {index + 1} / {total} 题
        </p>
        <p className="hint">已作答 {answeredCount} / {total}</p>
      </div>

      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${Math.round(((index + 1) / total) * 100)}%` }} />
      </div>

      <div className="exam-jump-grid" role="group" aria-label="题号导航">
        {questions.map((q, idx) => {
          const isCurrent = idx === index;
          const isAnswered = answersByIndex[idx] !== null;
          let cls = "exam-jump-item";
          if (isCurrent) cls += " exam-jump-item--current";
          else if (isAnswered) cls += " exam-jump-item--answered";
          return (
            <button key={q.id} type="button" className={cls} onClick={() => jumpTo(idx)}>
              {idx + 1}
            </button>
          );
        })}
      </div>

      <h1 className="question-text">
        <span className="question-code">[{current.id}]</span>
        {current.question}
      </h1>

      <div className="choices" role="group" aria-label="选项">
        {LETTERS.map((letter, i) => {
          const isSelected = answersByIndex[index] === letter;
          let cls = "choice";
          if (isSelected) cls += " exam-choice--selected";
          return (
            <button
              key={letter}
              type="button"
              className={cls}
              onClick={() => pickAnswer(letter)}
            >
              <span className="choice-letter">{letter}</span>
              <span className="choice-text">{current.options[i]}</span>
            </button>
          );
        })}
      </div>

      <div className="summary-actions">
        <button type="button" className="button-ghost" onClick={() => jumpTo(index - 1)} disabled={index <= 0}>
          上一题
        </button>
        <button
          type="button"
          className={isCurrentAnswered ? "button-primary" : "button-ghost"}
          onClick={() => jumpTo(index + 1)}
          disabled={!isCurrentAnswered || index >= total - 1}
        >
          下一题
        </button>
      </div>

      <div className="exam-submit-row">
        <button type="button" className="button-primary" onClick={handleSubmit}>
          提交试卷
        </button>
        {!canSubmit && <p className="hint">请先完成全部题目后再提交。</p>}
      </div>
    </div>
  );
}
