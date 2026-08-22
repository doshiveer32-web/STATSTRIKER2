function Navbar() {
  return (
    <header className="navbar">

      <div className="navbar-left">
        <button className="mobile-menu">
          ☰
        </button>

        <div>
          <h1>Football Analytics</h1>
          <p>Data-driven football insights</p>
        </div>
      </div>

      <div className="navbar-right">

        <div className="season-selector">
          <span>Season</span>

          <select defaultValue="2026">
            <option value="2026">2026/27</option>
            <option value="2025">2025/26</option>
          </select>
        </div>

      </div>

    </header>
  );
}

export default Navbar;