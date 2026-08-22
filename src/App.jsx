import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Competitions from "./pages/Competitions";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Analytics from "./pages/Analytics";
import Comparison from "./pages/Comparison";
import TeamDetails from "./pages/TeamDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Competitions */}
          <Route path="/competitions" element={<Competitions />} />

          {/* Matches */}
          <Route path="/matches" element={<Matches />} />

          {/* Teams */}
          <Route path="/teams" element={<Teams />} />

          {/* Individual Team */}
          <Route path="/teams/:id" element={<TeamDetails />} />

          {/* Players */}
          <Route path="/players" element={<Players />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Comparison */}
          <Route path="/comparison" element={<Comparison />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;