import { useMemo, useState } from "react";
import { MODULE_IDS, MODULE_LABELS, type ModuleId } from "../config/modules";
import { clearMistakes, loadMistakes, mistakesForModule } from "../lib/mistakes";

type Filter = "all" | ModuleId;

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Mistakes() {
  const [filter, setFilter] = useState<Filter>("all");
  const [storeTick, setStoreTick] = useState(0);

  const list = useMemo(() => {
    void storeTick;
    return mistakesForModule(filter);
  }, [filter, storeTick]);

  const totalAll = useMemo(() => {
    void storeTick;
    return loadMistakes().length;
  }, [storeTick]);

  return (
    <div className="mistakes-page">
      <section className="card mistakes-top">
        <p className="eyebrow">Mistake Notebook</p>
        <h1 className="page-title">错题本</h1>
        <p className="page-lead">题目保存在本机浏览器（localStorage），目前共 {totalAll} 条记录。</p>

        <div className="filter-row">
          <label htmlFor="module-filter">按模块筛选</label>
          <select
            id="module-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
          >
            <option value="all">全部</option>
            {MODULE_IDS.map((id) => (
              <option key={id} value={id}>
                {MODULE_LABELS[id]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button-danger"
            onClick={() => {
              if (window.confirm("确定清空所有错题记录？")) {
                clearMistakes();
                setFilter("all");
                setStoreTick((t) => t + 1);
              }
            }}
          >
            清空全部
          </button>
        </div>
      </section>

      {list.length === 0 ? (
        <section className="card state-card">
          <p className="empty">暂无错题，继续保持！</p>
        </section>
      ) : (
        <ul className="mistake-list" role="list">
          {list.map((m) => (
            <li key={`${m.module}-${m.id}-${m.savedAt}`} className="mistake-card card">
              <div className="mistake-head">
                <p className="mistake-module">{MODULE_LABELS[m.module]}</p>
                <span className="mistake-time">{formatTime(m.savedAt)}</span>
              </div>
              <p className="mistake-question">{m.question}</p>
              <p className="mistake-answers">
                你的答案：<span className="text-wrong">{m.user_answer}</span>
                {" · "}
                正确答案：<span className="text-correct">{m.correct_answer}</span>
              </p>
              <details>
                <summary>查看解析</summary>
                <p>{m.description}</p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
