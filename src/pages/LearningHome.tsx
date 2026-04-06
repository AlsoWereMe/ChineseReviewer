import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { MODULE_IDS, MODULE_LABELS, type ModuleId } from "../config/modules";
import { getQuestionsForModule } from "../data/loadQuestions";

const MODULE_MOTIFS = ["☯️", "🏯", "🖌️", "🏮", "🧭"] as const;

export function LearningHome() {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [randomCountInput, setRandomCountInput] = useState("20");
  const [randomError, setRandomError] = useState<string | null>(null);

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
      </ul>

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
