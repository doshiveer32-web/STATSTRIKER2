import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <h1>STATSTRIKER</h1>
        <p>FOOTBALL ANALYTICS</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Overview */}
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">▦</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/competitions"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">◈</span>
            <span>Competitions</span>
          </NavLink>
        </div>

        {/* Football */}
        <div className="nav-section">
          <div className="nav-section-title">Football</div>

          <NavLink
            to="/matches"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">◉</span>
            <span>Matches</span>
          </NavLink>

          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">♟</span>
            <span>Teams</span>
          </NavLink>

          <NavLink
            to="/players"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">●</span>
            <span>Players</span>
          </NavLink>
        </div>

        {/* Analysis */}
        <div className="nav-section">
          <div className="nav-section-title">Analysis</div>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">▥</span>
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/comparison"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">⇄</span>
            <span>Comparison</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="status-dot"></span>
        <span>API Connected</span>
      </div>
    </aside>
  );
}

export default Sidebar;