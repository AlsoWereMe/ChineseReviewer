import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { MODULE_IDS, MODULE_LABELS, type ModuleId } from "../config/modules";
import { getQuestionsForModule } from "../data/loadQuestions";
import { submitFeedback, type FeedbackType } from "../lib/feedback";

const MODULE_MOTIFS = ["☯️", "🏯", "🖌️", "🏮", "🧭"] as const;
const EXAM_MOTIF = "🧪";

export function LearningHome() {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [randomCountInput, setRandomCountInput] = useState("20");
  const [randomError, setRandomError] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const selectedPoolCount = useMemo(() => {
    if (!selectedModule) return 0;
    return getQuestionsForModule(selectedModule).length;
  }, [selectedModule]);

  function handleModuleClick(moduleId: ModuleId) {
    setSelectedModule(moduleId);
    setRandomCountInput("20");
    setRandomError(null);
  }

  function closeModeDialog() {
    setSelectedModule(null);
    setRandomError(null);
  }

  function startSequentialMode() {
    if (!selectedModule) return;
    navigate(`/review/${selectedModule}?mode=sequential`);
    closeModeDialog();
  }

  function startRandomMode() {
    if (!selectedModule) return;
    const parsed = Number.parseInt(randomCountInput, 10);
    if (!Number.isInteger(parsed) || parsed < 10 || parsed > 30) {
      setRandomError("题数必须为 10 到 30 之间的整数。");
      return;
    }
    navigate(`/review/${selectedModule}?mode=random&count=${parsed}`);
    closeModeDialog();
  }

  function openFeedbackDialog() {
    setIsFeedbackOpen(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);
  }

  function closeFeedbackDialog() {
    if (isSubmittingFeedback) return;
    setIsFeedbackOpen(false);
    setFeedbackType("bug");
    setFeedbackText("");
    setFeedbackError(null);
    setFeedbackSuccess(null);
  }

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = feedbackText.trim();
    if (!trimmedText) {
      setFeedbackError("请先填写反馈说明。");
      return;
    }
    if (trimmedText.length > 1000) {
      setFeedbackError("反馈说明不能超过 1000 字。");
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      await submitFeedback({
        feedbackTime: new Date().toISOString(),
        feedbackType,
        feedbackText: trimmedText,
      });
      setFeedbackSuccess("提交成功，感谢你的反馈。");
      setFeedbackText("");
      setFeedbackType("bug");
      window.setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSuccess(null);
      }, 900);
    } catch {
      setFeedbackError("提交失败，请稍后重试。");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  return (
    <div className="learning-home">
      <ul className="module-grid" role="list">
        {MODULE_IDS.map((id, idx) => (
          <li key={id}>
            <Link
              className="module-button"
              to={`/review/${id}`}
              onClick={(e) => {
                e.preventDefault();
                handleModuleClick(id);
              }}
            >
              <span className="module-icon" aria-hidden="true">
                {MODULE_MOTIFS[idx] ?? "📜"}
              </span>
              <span className="module-index">0{idx + 1}</span>
              <span className="module-name">{MODULE_LABELS[id]}</span>
              <span className="module-hint">进入练习</span>
            </Link>
          </li>
        ))}
        <li key="exam-module">
          <Link className="module-button" to="/exams">
            <span className="module-icon" aria-hidden="true">
              {EXAM_MOTIF}
            </span>
            <span className="module-index">06</span>
            <span className="module-name">模拟测试</span>
            <span className="module-hint">选择试卷</span>
          </Link>
        </li>
      </ul>
      <div className="feedback-entry card">
        <div className="feedback-entry-copy">
          <h2 className="feedback-entry-title">有问题或建议？</h2>
          <p className="hint feedback-entry-note">
            仅提交反馈时间、反馈类型和反馈说明，不收集个人身份信息。
          </p>
        </div>
        <button type="button" className="button-primary" onClick={openFeedbackDialog}>
          反馈意见
        </button>
      </div>

      {isFeedbackOpen && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="feedback-dialog-title">
          <div className="feedback-dialog card">
            <h2 id="feedback-dialog-title" className="confirm-title">
              提交反馈
            </h2>
            <p className="confirm-message">请选择反馈类型并填写说明，提交后会直接发送。</p>
            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <fieldset className="feedback-type-group">
                <legend className="feedback-label">反馈类型</legend>
                <label className="feedback-type-option">
                  <input
                    type="radio"
                    name="feedback-type"
                    value="bug"
                    checked={feedbackType === "bug"}
                    onChange={() => setFeedbackType("bug")}
                    disabled={isSubmittingFeedback}
                  />
                  <span>Bug</span>
                </label>
                <label className="feedback-type-option">
                  <input
                    type="radio"
                    name="feedback-type"
                    value="improvement"
                    checked={feedbackType === "improvement"}
                    onChange={() => setFeedbackType("improvement")}
                    disabled={isSubmittingFeedback}
                  />
                  <span>改进意见</span>
                </label>
              </fieldset>

              <label className="feedback-label" htmlFor="feedback-text">
                反馈说明
              </label>
              <textarea
                id="feedback-text"
                className="feedback-textarea"
                rows={6}
                maxLength={1000}
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  setFeedbackError(null);
                }}
                placeholder="请描述你遇到的问题或希望改进的点"
                disabled={isSubmittingFeedback}
              />
              <p className="hint feedback-counter">{feedbackText.trim().length}/1000</p>

              {feedbackError && <p className="text-wrong">{feedbackError}</p>}
              {feedbackSuccess && <p className="text-correct">{feedbackSuccess}</p>}

              <div className="confirm-actions">
                <button type="button" className="button-ghost" onClick={closeFeedbackDialog} disabled={isSubmittingFeedback}>
                  取消
                </button>
                <button type="submit" className="button-primary" disabled={isSubmittingFeedback}>
                  {isSubmittingFeedback ? "提交中..." : "一键提交"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedModule && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="mode-dialog-title">
          <div className="mode-dialog card">
            <h2 id="mode-dialog-title" className="confirm-title">
              选择学习模式 · {MODULE_LABELS[selectedModule]}
            </h2>
            <p className="confirm-message">请从以下两种模式中选择一种开始学习。</p>

            <section className="mode-block">
              <h3 className="mode-title">随机复习指定题数</h3>
              <p className="hint">可输入 10 到 30 题。当前模块共 {selectedPoolCount} 题。</p>
              <div className="mode-random-row">
                <input
                  className="mode-input"
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={30}
                  value={randomCountInput}
                  onChange={(e) => {
                    setRandomCountInput(e.target.value);
                    setRandomError(null);
                  }}
                />
                <button type="button" className="button-primary" onClick={startRandomMode}>
                  开始随机复习
                </button>
              </div>
              {randomError && <p className="text-wrong">{randomError}</p>}
            </section>

            <section className="mode-block">
              <h3 className="mode-title">按顺序浏览全部题目</h3>
              <p className="hint">按题库顺序逐题作答，并支持按题号快速跳转。</p>
              <button type="button" className="button-ghost" onClick={startSequentialMode}>
                开始顺序浏览
              </button>
            </section>

            <div className="confirm-actions">
              <button type="button" className="button-ghost" onClick={closeModeDialog}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
