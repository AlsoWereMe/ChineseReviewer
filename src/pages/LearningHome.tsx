import { Link, useNavigate } from "react-router-dom";
import { MODULE_IDS, MODULE_LABELS, type ModuleId } from "../config/modules";
import {
  clearAllReviewProgress,
  loadSavedProgress,
} from "../lib/reviewProgress";
import { useConfirm } from "../components/ConfirmProvider";

const MODULE_MOTIFS = ["☯️", "🏯", "🖌️", "🏮", "🧭"] as const;

export function LearningHome() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  async function handleModuleClick(moduleId: ModuleId) {
    const saved = loadSavedProgress();
    if (!saved) {
      navigate(`/review/${moduleId}`);
      return;
    }
    if (saved.moduleId === moduleId) {
      navigate(`/review/${moduleId}`);
      return;
    }
    const shouldClear = await confirm({
      title: "切换学习模块",
      message: `检测到你在「${MODULE_LABELS[saved.moduleId]}」有已保存进度。是否清除该进度，并开始「${MODULE_LABELS[moduleId]}」？`,
      confirmText: `开始${MODULE_LABELS[moduleId]}`,
      cancelText: "保留原进度",
    });
    if (!shouldClear) return;
    clearAllReviewProgress();
    navigate(`/review/${moduleId}`);
  }

  return (
    <div className="learning-home">
      <ul className="module-grid" role="list">
        {MODULE_IDS.map((id, idx) => (
          <li key={id}>
            <Link
              className="module-button"
              to={`/review/${id}`}
              onClick={async (e) => {
                e.preventDefault();
                await handleModuleClick(id);
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
    </div>
  );
}
