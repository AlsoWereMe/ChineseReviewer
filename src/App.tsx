import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { LearningHome } from "./pages/LearningHome";
import { Review } from "./pages/Review";
import { Mistakes } from "./pages/Mistakes";
import { QuestionBank } from "./pages/QuestionBank";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { ExamHome } from "./pages/ExamHome";
import { Exam } from "./pages/Exam";
import { KnownIssues } from "./pages/KnownIssues";

export default function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LearningHome />} />
            <Route path="review/:moduleId" element={<Review />} />
            <Route path="exams" element={<ExamHome />} />
            <Route path="exam/:paperId" element={<Exam />} />
            <Route path="mistakes" element={<Mistakes />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="known-issues" element={<KnownIssues />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  );
}
