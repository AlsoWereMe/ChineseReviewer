import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-wrap">
          <span className="brand-dot" aria-hidden="true" />
          <div>
            <NavLink to="/" className="app-title">
              Chinese Knowledge Reviewer
            </NavLink>
            <p className="app-subtitle">轻量 · 专注 · 可分享</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="主导航">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            学习
          </NavLink>
          <NavLink
            to="/mistakes"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            错题
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
