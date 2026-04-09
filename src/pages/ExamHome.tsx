import { Link } from "react-router-dom";
import { getExamPapers } from "../data/loadExams";

export function ExamHome() {
  const papers = getExamPapers();

  return (
    <div className="exam-home-page">
      <section className="card">
        <h1 className="page-title">模拟测试</h1>
        <p className="page-lead">请选择一套试卷开始考试。每套试卷固定 20 题。</p>
      </section>

      {papers.length === 0 ? (
        <section className="card state-card">
          <p className="empty">暂未发现可用试卷，请在 `src/data/exams/` 中添加 JSON 文件。</p>
        </section>
      ) : (
        <ul className="exam-paper-grid" role="list">
          {papers.map((paper) => (
            <li key={paper.id} className="card exam-paper-card">
              <p className="exam-paper-title">{paper.title}</p>
              <p className="hint">试卷编号：{paper.id}</p>
              <p className="hint">题量：{paper.questionCount} 题</p>
              {paper.error ? (
                <>
                  <p className="text-wrong">该试卷暂不可用：{paper.error}</p>
                  <button type="button" className="button-ghost" disabled>
                    数据待修复
                  </button>
                </>
              ) : (
                <Link to={`/exam/${paper.id}`} className="button-primary exam-paper-start">
                  开始考试
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
