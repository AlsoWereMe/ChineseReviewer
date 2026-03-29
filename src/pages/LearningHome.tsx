import { Link } from "react-router-dom";
import { MODULE_IDS, MODULE_LABELS } from "../config/modules";

const MODULE_MOTIFS = ["📜", "🪭", "🍵", "🏮", "🏯"] as const;

export function LearningHome() {
  return (
    <div className="learning-home">
      <section className="home-hero card">
        <p className="eyebrow">Chinese Knowledge Reviewer</p>
        <h1 className="page-title">开始你的中文复习</h1>
        <p className="page-lead">
          选择一个模块，系统会随机抽取最多 20 道题并即时反馈结果与解析。
        </p>
      </section>

      <ul className="module-grid" role="list">
        {MODULE_IDS.map((id, idx) => (
          <li key={id}>
            <Link className="module-button" to={`/review/${id}`}>
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
