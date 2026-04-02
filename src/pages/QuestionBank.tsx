import { useMemo, useState } from "react";
import { MODULE_IDS, MODULE_LABELS } from "../config/modules";
import { getQuestionsForModule } from "../data/loadQuestions";

const LETTERS = ["A", "B", "C", "D"] as const;

export function QuestionBank() {
  const [keyword, setKeyword] = useState("");
  const search = keyword.trim().toLowerCase();

  const moduleData = useMemo(() => {
    return MODULE_IDS.map((moduleId) => {
      const fullList = getQuestionsForModule(moduleId);
      if (!search) return { moduleId, list: fullList };
      const filtered = fullList.filter((q) => {
        if (q.question.toLowerCase().includes(search)) return true;
        if (q.description.toLowerCase().includes(search)) return true;
        return q.options.some((opt) => opt.toLowerCase().includes(search));
      });
      return { moduleId, list: filtered };
    });
  }, [search]);

  const totalMatched = useMemo(
    () => moduleData.reduce((sum, item) => sum + item.list.length, 0),
    [moduleData],
  );

  return (
    <div className="question-bank-page">
      <section className="card">
        <p className="eyebrow">Question Base</p>
        <h1 className="page-title">题库总览</h1>
        <p className="page-lead">查看所有模块中的完整题目、选项、答案与解析。</p>
        <div className="bank-search-wrap">
          <label htmlFor="bank-search" className="bank-search-label">
            关键词搜索
          </label>
          <input
            id="bank-search"
            className="bank-search-input"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="输入题干、选项或解析关键词"
          />
          <p className="bank-search-meta">
            {search ? `当前匹配 ${totalMatched} 道题` : "未搜索时显示全部题目"}
          </p>
        </div>
      </section>

      {moduleData.map(({ moduleId, list }) => {
        return (
          <details key={moduleId} className="module-accordion card bank-module" open={!search}>
            <summary className="module-accordion-summary">
              <span className="bank-module-title">{MODULE_LABELS[moduleId]}</span>
            </summary>
            {list.length === 0 ? (
              <p className="empty">该模块暂未录入题目。</p>
            ) : (
              <ul className="bank-question-list" role="list">
                {list.map((q, qIdx) => (
                  <li key={q.id} className="bank-question-card">
                    <p className="bank-question-text">
                      {qIdx + 1}. {q.question}
                    </p>
                    <ul className="bank-options" role="list">
                      {q.options.map((opt, i) => {
                        const letter = LETTERS[i]!;
                        const isCorrect = letter === q.correct_answer;
                        return (
                          <li
                            key={`${q.id}-${letter}`}
                            className={isCorrect ? "bank-option bank-option--correct" : "bank-option"}
                          >
                            <span className="bank-option-letter">{letter}</span>
                            <span>{opt}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="bank-answer">
                      正确答案：
                      <span className="answer-badge answer-badge--correct">{q.correct_answer}</span>
                    </p>
                    <p className="bank-description">{q.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </details>
        );
      })}
    </div>
  );
}
