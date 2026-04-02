import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  clearAllReviewProgress,
  loadDraftProgress,
  loadSavedProgress,
  saveDraftToSaved,
} from "../lib/reviewProgress";
import { useConfirm } from "../components/ConfirmProvider";

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const homeActive = pathname === "/";
  const learningActive = pathname.startsWith("/review");
  const mistakesActive = pathname.startsWith("/mistakes");
  const bankActive = pathname.startsWith("/question-bank");
  const inReview = pathname.startsWith("/review");

  async function handleNavClick(target: string, preferSavedReview = false) {
    if (inReview) {
      const draft = loadDraftProgress();
      if (draft && draft.phase === "quiz") {
        const keep = await confirm({
          title: "离开当前学习",
          message: "检测到你正在答题中。是否保存当前学习进度？",
          confirmText: "保存进度",
          cancelText: "不保存并清除",
        });
        if (keep) saveDraftToSaved();
        else clearAllReviewProgress();
      }
    }
    if (preferSavedReview) {
      const saved = loadSavedProgress();
      if (saved && saved.phase === "quiz") {
        navigate(`/review/${saved.moduleId}`);
        return;
      }
    }
    navigate(target);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-wrap">
          <span className="brand-dot" aria-hidden="true" />
          <div>
            <NavLink to="/" className="app-title">
              中华文化常识复习工具
            </NavLink>
            <p className="app-subtitle">一个简单的文化常识复习书</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="主导航">
          <Link
            to="/"
            className={homeActive ? "nav-link nav-link--active" : "nav-link"}
            onClick={async (e) => {
              e.preventDefault();
              await handleNavClick("/");
            }}
          >
            主页
          </Link>
          <Link
            to="/"
            className={learningActive ? "nav-link nav-link--active" : "nav-link"}
            onClick={async (e) => {
              e.preventDefault();
              await handleNavClick("/", true);
            }}
          >
            学习
          </Link>
          <Link
            to="/mistakes"
            className={mistakesActive ? "nav-link nav-link--active" : "nav-link"}
            onClick={async (e) => {
              e.preventDefault();
              await handleNavClick("/mistakes");
            }}
          >
            错题
          </Link>
          <Link
            to="/question-bank"
            className={bankActive ? "nav-link nav-link--active" : "nav-link"}
            onClick={async (e) => {
              e.preventDefault();
              await handleNavClick("/question-bank");
            }}
          >
            题库
          </Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
