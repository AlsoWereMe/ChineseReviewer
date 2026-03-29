import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { LearningHome } from "./pages/LearningHome";
import { Review } from "./pages/Review";
import { Mistakes } from "./pages/Mistakes";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LearningHome />} />
          <Route path="review/:moduleId" element={<Review />} />
          <Route path="mistakes" element={<Mistakes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
