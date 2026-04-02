import { useMemo, useState } from "react";
import { MODULE_IDS, MODULE_LABELS, type ModuleId } from "../config/modules";
import { clearMistakes, loadMistakes, mistakesForModule } from "../lib/mistakes";
import { useConfirm } from "../components/ConfirmProvider";

type Filter = "all" | ModuleId;
const LETTERS = ["A", "B", "C", "D"] as const;

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
  const confirm = useConfirm();

  const list = useMemo(() => {
    void storeTick;
    return mistakesForModule(filter);
  }, [filter, storeTick]);

  const totalAll = useMemo(() => {
    void storeTick;
    return loadMistakes().length;
  }, [storeTick]);

  const grouped = useMemo(() => {
    const byModule = new Map<ModuleId, typeof list>();
    list.forEach((item) => {
      const arr = byModule.get(item.module);
      if (arr) arr.push(item);
      else byModule.set(item.module, [item]);
    });
    return MODULE_IDS.filter((id) => byModule.has(id)).map((id) => ({
      moduleId: id,
      items: byModule.get(id) ?? [],
    }));
  }, [list]);

  return (
    <div className="mistakes-page">
      <section className="card mistakes-top">
        <h1 className="page-title">错题本</h1>
        <p className="page-lead">题目保存在本机浏览器。</p>

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
            onClick={async () => {
              const shouldClear = await confirm({
                title: "清空错题记录",
                message: "该操作会删除当前所有错题记录，是否继续？",
                confirmText: "确认清空",
                cancelText: "取消",
              });
              if (shouldClear) {
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
        <div className="module-accordion-list">
          {grouped.map(({ moduleId, items }) => (
            <details key={moduleId} className="module-accordion card" open={filter !== "all"}>
              <summary className="module-accordion-summary">
                <span>{MODULE_LABELS[moduleId]}</span>
              </summary>
              <ul className="mistake-list" role="list">
                {items.map((m) => (
                  <li key={`${m.module}-${m.id}-${m.savedAt}`} className="mistake-card card">
                    <div className="mistake-head">
                      <p className="mistake-module">{MODULE_LABELS[m.module]}</p>
                      <span className="mistake-time">{formatTime(m.savedAt)}</span>
                    </div>
                    <p className="mistake-question">{m.question}</p>
                    <p className="mistake-answers">
                      你的答案：
                      <span className="answer-badge answer-badge--wrong">{m.user_answer}</span>
                      {" · "}
                      正确答案：
                      <span className="answer-badge answer-badge--correct">{m.correct_answer}</span>
                    </p>
                    <ul className="mistake-options" role="list">
                      {m.options.map((option, idx) => {
                        const letter = LETTERS[idx]!;
                        const isCorrect = letter === m.correct_answer;
                        const isUser = letter === m.user_answer;
                        let cls = "mistake-option";
                        if (isCorrect) cls += " mistake-option--correct";
                        if (isUser && !isCorrect) cls += " mistake-option--user";
                        return (
                          <li key={`${m.id}-${letter}`} className={cls}>
                            <span className="mistake-option-letter">{letter}</span>
                            <span className="mistake-option-text">{option}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <details>
                      <summary>查看解析</summary>
                      <p>{m.description}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
