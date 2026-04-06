import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAllReviewProgress } from "../lib/reviewProgress";

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const homeActive = pathname === "/";
  const mistakesActive = pathname.startsWith("/mistakes");
  const bankActive = pathname.startsWith("/question-bank");
  const inReview = pathname.startsWith("/review");

  function handleNavClick(target: string) {
    if (inReview) {
      clearAllReviewProgress();
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
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/");
            }}
          >
            主页
          </Link>
          <Link
            to="/mistakes"
            className={mistakesActive ? "nav-link nav-link--active" : "nav-link"}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/mistakes");
            }}
          >
            错题
          </Link>
          <Link
            to="/question-bank"
            className={bankActive ? "nav-link nav-link--active" : "nav-link"}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/question-bank");
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
