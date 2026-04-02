import { MODULE_IDS, MODULE_LABELS } from "../config/modules";
import { getQuestionsForModule } from "../data/loadQuestions";

const LETTERS = ["A", "B", "C", "D"] as const;

export function QuestionBank() {
  return (
    <div className="question-bank-page">
      <section className="card">
        <p className="eyebrow">Question Base</p>
        <h1 className="page-title">题库总览</h1>
        <p className="page-lead">查看所有模块中的完整题目、选项、答案与解析。</p>
      </section>

      {MODULE_IDS.map((moduleId) => {
        const list = getQuestionsForModule(moduleId);
        return (
          <section key={moduleId} className="card bank-module">
            <h2 className="bank-module-title">
              {MODULE_LABELS[moduleId]}（共 {list.length} 题）
            </h2>
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
          </section>
        );
      })}
    </div>
  );
}
