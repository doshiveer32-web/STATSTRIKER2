import { useEffect, useMemo, useState } from "react";

import {
  getCompetitionStandings,
  getCompetitionMatches,
  getCompetitionScorers,
} from "../services/footballApi";

const leagues = [
  {
    code: "PL",
    name: "Premier League",
    country: "England",
  },
  {
    code: "PD",
    name: "LALIGA",
    country: "Spain",
  },
  {
    code: "SA",
    name: "Serie A",
    country: "Italy",
  },
  {
    code: "BL1",
    name: "Bundesliga",
    country: "Germany",
  },
  {
    code: "FL1",
    name: "Ligue 1",
    country: "France",
  },
];

function Dashboard() {
  const [selectedLeague, setSelectedLeague] = useState("PL");
  const [selectedSeason, setSelectedSeason] = useState("2025");

  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [scorers, setScorers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          standingsData,
          matchesData,
          scorersData,
        ] = await Promise.all([
          getCompetitionStandings(
            selectedLeague,
            selectedSeason
          ),
          getCompetitionMatches(
            selectedLeague,
            selectedSeason
          ),
          getCompetitionScorers(
            selectedLeague,
            selectedSeason
          ),
        ]);

        const table =
          standingsData.standings?.find(
            (item) => item.type === "TOTAL"
          )?.table || [];

        setStandings(table);
        setMatches(matchesData.matches || []);
        setScorers(scorersData.scorers || []);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedLeague, selectedSeason]);

  const leagueName =
    leagues.find(
      (league) => league.code === selectedLeague
    )?.name || "";

  const finishedMatches = useMemo(
    () =>
      matches.filter(
        (match) => match.status === "FINISHED"
      ),
    [matches]
  );

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter(
          (match) =>
            match.status === "SCHEDULED" ||
            match.status === "TIMED"
        )
        .sort(
          (a, b) =>
            new Date(a.utcDate) -
            new Date(b.utcDate)
        )
        .slice(0, 5),
    [matches]
  );

  const totalGoals = useMemo(
    () =>
      standings.reduce(
        (total, team) =>
          total + (team.goalsFor || 0),
        0
      ),
    [standings]
  );

  const totalMatches = useMemo(
    () =>
      Math.round(
        standings.reduce(
          (total, team) =>
            total + (team.playedGames || 0),
          0
        ) / 2
      ),
    [standings]
  );

  const topTeams = useMemo(
    () =>
      [...standings]
        .sort(
          (a, b) =>
            a.position - b.position
        )
        .slice(0, 5),
    [standings]
  );

  const topScorers = useMemo(
    () =>
      [...scorers]
        .sort(
          (a, b) =>
            (b.goals || 0) -
            (a.goals || 0)
        )
        .slice(0, 5),
    [scorers]
  );

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "--:--";

    return new Date(date).toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getScore = (match, side) => {
    if (
      match.status !== "FINISHED" &&
      match.status !== "IN_PLAY" &&
      match.status !== "PAUSED"
    ) {
      return "-";
    }

    return (
      match.score?.fullTime?.[side] ?? "-"
    );
  };

  return (
    <main className="page dashboard-page">

      {/* ================================
          HEADER
      ================================= */}

      <div className="dashboard-header">
        <div>
          <span className="section-label">
            FOOTBALL DATA CENTRE
          </span>

          <h1>
            Football Intelligence
          </h1>

          <p>
            Live league data, fixtures,
            standings and player
            performance.
          </p>
        </div>

        <div className="dashboard-live">
          <span></span>
          LIVE DATA
        </div>
      </div>


      {/* ================================
          LEAGUE SELECTOR
      ================================= */}

      <section className="dashboard-leagues">
        {leagues.map((league) => (
          <button
            key={league.code}
            type="button"
            className={
              selectedLeague === league.code
                ? "dashboard-league active"
                : "dashboard-league"
            }
            onClick={() =>
              setSelectedLeague(
                league.code
              )
            }
          >
            <strong>
              {league.name}
            </strong>

            <span>
              {league.country}
            </span>
          </button>
        ))}
      </section>


      {/* ================================
          SEASON TOOLBAR
      ================================= */}

      <div className="dashboard-toolbar">
        <div>
          <span>
            CURRENT COMPETITION
          </span>

          <strong>
            {leagueName}
          </strong>
        </div>

        <div className="dashboard-season">
          <button
            type="button"
            className={
              selectedSeason === "2025"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedSeason("2025")
            }
          >
            2025-26
          </button>

          <button
            type="button"
            className={
              selectedSeason === "2026"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedSeason("2026")
            }
          >
            2026-27
          </button>
        </div>
      </div>


      {/* ================================
          LOADING
      ================================= */}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>

          <p>
            Loading football data...
          </p>
        </div>
      )}


      {/* ================================
          ERROR
      ================================= */}

      {!loading && error && (
        <div className="error-card">
          <h2>
            Dashboard unavailable
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>
        </div>
      )}


      {!loading &&
        !error &&
        standings.length > 0 && (
          <>

            {/* ================================
                STATS
            ================================= */}

            <section className="dashboard-stats">

              <div className="dashboard-stat">
                <span>TEAMS</span>

                <strong>
                  {standings.length}
                </strong>

                <small>
                  Clubs competing
                </small>
              </div>


              <div className="dashboard-stat">
                <span>MATCHES</span>

                <strong>
                  {totalMatches}
                </strong>

                <small>
                  Matches in season
                </small>
              </div>


              <div className="dashboard-stat">
                <span>FINISHED</span>

                <strong>
                  {finishedMatches.length}
                </strong>

                <small>
                  Completed matches
                </small>
              </div>


              <div className="dashboard-stat highlight">
                <span>GOALS</span>

                <strong>
                  {totalGoals}
                </strong>

                <small>
                  Goals scored
                </small>
              </div>

            </section>


            {/* ================================
                MAIN GRID
            ================================= */}

            <section className="dashboard-grid">

              {/* STANDINGS */}

              <div className="dashboard-panel standings-panel">

                <div className="panel-header">
                  <div>
                    <span>
                      TABLE
                    </span>

                    <h2>
                      Standings
                    </h2>
                  </div>

                  <a href="/teams">
                    View all
                  </a>
                </div>


                <div className="dashboard-table">

                  <div className="dashboard-table-header">
                    <span>#</span>
                    <span>TEAM</span>
                    <span>P</span>
                    <span>W</span>
                    <span>D</span>
                    <span>L</span>
                    <span>GD</span>
                    <span>PTS</span>
                  </div>


                  {topTeams.map((team) => (
                    <div
                      className="dashboard-table-row"
                      key={team.team.id}
                    >

                      <span>
                        {team.position}
                      </span>

                      <div className="dashboard-team-name">

                        {team.team.crest && (
                          <img
                            src={team.team.crest}
                            alt=""
                          />
                        )}

                        <strong>
                          {team.team.shortName ||
                            team.team.name}
                        </strong>

                      </div>

                      <span>
                        {team.playedGames}
                      </span>

                      <span>
                        {team.won}
                      </span>

                      <span>
                        {team.draw}
                      </span>

                      <span>
                        {team.lost}
                      </span>

                      <span>
                        {team.goalDifference}
                      </span>

                      <strong>
                        {team.points}
                      </strong>

                    </div>
                  ))}

                </div>
              </div>


              {/* UPCOMING */}

              <div className="dashboard-panel">

                <div className="panel-header">

                  <div>
                    <span>
                      FIXTURES
                    </span>

                    <h2>
                      Upcoming
                    </h2>
                  </div>

                  <a href="/matches">
                    All matches
                  </a>

                </div>


                <div className="dashboard-matches">

                  {upcomingMatches.length === 0 && (
                    <div className="dashboard-empty">
                      No upcoming matches.
                    </div>
                  )}


                  {upcomingMatches.map(
                    (match) => (
                      <div
                        className="dashboard-match"
                        key={match.id}
                      >

                        <div className="dashboard-match-date">
                          <strong>
                            {formatDate(
                              match.utcDate
                            )}
                          </strong>

                          <span>
                            {formatTime(
                              match.utcDate
                            )}
                          </span>
                        </div>


                        <div className="dashboard-match-team">

                          {match.homeTeam?.crest && (
                            <img
                              src={
                                match.homeTeam.crest
                              }
                              alt=""
                            />
                          )}

                          <span>
                            {
                              match.homeTeam
                                ?.shortName
                            }
                          </span>

                        </div>


                        <div className="dashboard-vs">
                          VS
                        </div>


                        <div className="dashboard-match-team away">

                          <span>
                            {
                              match.awayTeam
                                ?.shortName
                            }
                          </span>

                          {match.awayTeam?.crest && (
                            <img
                              src={
                                match.awayTeam.crest
                              }
                              alt=""
                            />
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

            </section>


            {/* ================================
                SECOND GRID
            ================================= */}

            <section className="dashboard-grid">

              {/* TOP SCORERS */}

              <div className="dashboard-panel">

                <div className="panel-header">

                  <div>
                    <span>
                      PLAYERS
                    </span>

                    <h2>
                      Top Scorers
                    </h2>
                  </div>

                  <a href="/players">
                    View players
                  </a>

                </div>


                <div className="scorers-list">

                  {topScorers.map(
                    (item, index) => (
                      <div
                        className="scorer-row"
                        key={
                          item.player?.id ||
                          index
                        }
                      >

                        <span className="scorer-position">
                          {index + 1}
                        </span>


                        <div className="scorer-player">

                          {item.team?.crest && (
                            <img
                              src={
                                item.team.crest
                              }
                              alt=""
                            />
                          )}

                          <div>

                            <strong>
                              {
                                item.player
                                  ?.name
                              }
                            </strong>

                            <span>
                              {
                                item.team
                                  ?.shortName
                              }
                            </span>

                          </div>

                        </div>


                        <strong className="scorer-goals">
                          {item.goals}
                        </strong>

                      </div>
                    )
                  )}

                </div>

              </div>


              {/* TEAM PERFORMANCE */}

              <div className="dashboard-panel">

                <div className="panel-header">

                  <div>
                    <span>
                      PERFORMANCE
                    </span>

                    <h2>
                      Team Overview
                    </h2>
                  </div>

                  <a href="/analytics">
                    Analytics
                  </a>

                </div>


                <div className="performance-list">

                  {topTeams.map(
                    (team) => {

                      const maxPoints =
                        topTeams[0]?.points ||
                        1;

                      const percentage =
                        (team.points /
                          maxPoints) *
                        100;

                      return (
                        <div
                          className="performance-row"
                          key={
                            team.team.id
                          }
                        >

                          <div className="performance-label">

                            <span>
                              {
                                team.position
                              }
                            </span>

                            <strong>
                              {team.team.shortName ||
                                team.team.name}
                            </strong>

                          </div>


                          <div className="performance-track">

                            <div
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></div>

                          </div>


                          <strong>
                            {team.points}
                          </strong>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </section>


            {/* ================================
                RECENT RESULTS
            ================================= */}

            <section className="dashboard-panel recent-results">

              <div className="panel-header">

                <div>
                  <span>
                    RESULTS
                  </span>

                  <h2>
                    Recent Matches
                  </h2>
                </div>

                <a href="/matches">
                  Match centre
                </a>

              </div>


              <div className="recent-results-grid">

                {finishedMatches
                  .slice(-6)
                  .reverse()
                  .map((match) => (

                    <div
                      className="result-card"
                      key={match.id}
                    >

                      <span>
                        {formatDate(
                          match.utcDate
                        )}
                      </span>


                      <div>

                        <strong>
                          {
                            match.homeTeam
                              ?.shortName
                          }
                        </strong>

                        <b>
                          {getScore(
                            match,
                            "home"
                          )}
                        </b>

                      </div>


                      <div>

                        <strong>
                          {
                            match.awayTeam
                              ?.shortName
                          }
                        </strong>

                        <b>
                          {getScore(
                            match,
                            "away"
                          )}
                        </b>

                      </div>

                    </div>

                  ))}

              </div>

            </section>


            {/* ==================================================
                SDG MAPPING
            ================================================== */}

            <section className="dashboard-sdg-section">

              <div className="dashboard-sdg-heading">

                <div>
                  <span>
                    SUSTAINABILITY
                  </span>

                  <h2>
                    SDG Mapping
                  </h2>

                  <p>
                    How the football intelligence
                    platform contributes to selected
                    United Nations Sustainable
                    Development Goals.
                  </p>
                </div>

                <div className="sdg-badge">
                  UN SDGs
                </div>

              </div>


              <div className="sdg-grid">

                {/* SDG 3 */}

                <div className="sdg-card sdg-3">

                  <div className="sdg-number">
                    03
                  </div>

                  <div className="sdg-content">

                    <span className="sdg-label">
                      SDG 3
                    </span>

                    <h3>
                      Good Health &
                      Well-being
                    </h3>

                    <p>
                      Encourages active lifestyles
                      and engagement with sport
                      through football data,
                      performance insights and
                      participation.
                    </p>

                  </div>

                </div>


                {/* SDG 9 */}

                <div className="sdg-card sdg-9">

                  <div className="sdg-number">
                    09
                  </div>

                  <div className="sdg-content">

                    <span className="sdg-label">
                      SDG 9
                    </span>

                    <h3>
                      Industry, Innovation
                      & Infrastructure
                    </h3>

                    <p>
                      Uses digital technology,
                      APIs and data analytics to
                      build an intelligent football
                      information platform.
                    </p>

                  </div>

                </div>


                {/* SDG 12 */}

                <div className="sdg-card sdg-12">

                  <div className="sdg-number">
                    12
                  </div>

                  <div className="sdg-content">

                    <span className="sdg-label">
                      SDG 12
                    </span>

                    <h3>
                      Responsible Consumption
                      & Production
                    </h3>

                    <p>
                      Promotes responsible use of
                      digital resources and
                      data-driven decision making
                      through an efficient platform.
                    </p>

                  </div>

                </div>

              </div>

            </section>


            {/* ==================================================
                DEVELOPER
            ================================================== */}

            <section className="dashboard-developer">

              <div className="developer-mark">
                VD
              </div>

              <div className="developer-info">

                <span>
                  BUILT & DEVELOPED BY
                </span>

                <h2>
                  Veer Doshi
                </h2>

                <p>
                  Developer • Football Intelligence
                  Platform
                </p>

              </div>

              <div className="developer-tech">
                <span>
                  DATA
                </span>

                <span>
                  ANALYTICS
                </span>

                <span>
                  INNOVATION
                </span>
              </div>

            </section>

          </>
        )}

    </main>
  );
}

export default Dashboard;