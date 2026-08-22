import { useEffect, useMemo, useState } from "react";

import {
  getCompetitionStandings,
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

function Analytics() {
  const [selectedLeague, setSelectedLeague] =
    useState("PL");

  const [selectedSeason, setSelectedSeason] =
    useState("2026");

  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getCompetitionStandings(
            selectedLeague,
            selectedSeason
          );

        const table =
          data.standings?.find(
            (standing) =>
              standing.type === "TOTAL"
          )?.table || [];

        setTeams(table);
      } catch (err) {
        console.error(
          "Analytics error:",
          err
        );

        setError(
          err.message ||
            "Unable to load analytics."
        );

        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedLeague, selectedSeason]);

  const statistics = useMemo(() => {
    if (!teams.length) {
      return {
        totalMatches: 0,
        totalGoals: 0,
        averageGoals: 0,
        bestAttack: null,
        bestDefense: null,
        mostWins: null,
        mostLosses: null,
        highestPoints: null,
      };
    }

    const totalMatches = Math.round(
      teams.reduce(
        (sum, team) =>
          sum + team.playedGames,
        0
      ) / 2
    );

    const totalGoals = teams.reduce(
      (sum, team) =>
        sum + team.goalsFor,
      0
    );

    const bestAttack = [...teams].sort(
      (a, b) =>
        b.goalsFor - a.goalsFor
    )[0];

    const bestDefense = [...teams].sort(
      (a, b) =>
        a.goalsAgainst -
        b.goalsAgainst
    )[0];

    const mostWins = [...teams].sort(
      (a, b) =>
        b.won - a.won
    )[0];

    const mostLosses = [...teams].sort(
      (a, b) =>
        b.lost - a.lost
    )[0];

    const highestPoints = [...teams].sort(
      (a, b) =>
        b.points - a.points
    )[0];

    return {
      totalMatches,
      totalGoals,
      averageGoals:
        totalMatches > 0
          ? (
              totalGoals /
              totalMatches
            ).toFixed(2)
          : "0.00",
      bestAttack,
      bestDefense,
      mostWins,
      mostLosses,
      highestPoints,
    };
  }, [teams]);

  const sortedByGoals = useMemo(() => {
    return [...teams]
      .sort(
        (a, b) =>
          b.goalsFor - a.goalsFor
      )
      .slice(0, 10);
  }, [teams]);

  const sortedByConceded = useMemo(() => {
    return [...teams]
      .sort(
        (a, b) =>
          a.goalsAgainst -
          b.goalsAgainst
      )
      .slice(0, 10);
  }, [teams]);

  const sortedByPoints = useMemo(() => {
    return [...teams]
      .sort(
        (a, b) =>
          b.points - a.points
      )
      .slice(0, 10);
  }, [teams]);

  const getWinRate = (team) => {
    if (!team.playedGames) {
      return 0;
    }

    return (
      (team.won /
        team.playedGames) *
      100
    ).toFixed(1);
  };

  const leagueName =
    leagues.find(
      (league) =>
        league.code === selectedLeague
    )?.name || "";

  return (
    <main className="page analytics-page">
      {/* Header */}

      <div className="page-header">
        <div>
          <span className="section-label">
            PERFORMANCE DATA
          </span>

          <h1>Analytics</h1>

          <p>
            League-wide statistics and
            performance insights.
          </p>
        </div>
      </div>

      {/* League selector */}

      <section className="analytics-leagues">
        {leagues.map((league) => (
          <button
            type="button"
            key={league.code}
            className={
              selectedLeague ===
              league.code
                ? "analytics-league active"
                : "analytics-league"
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

      {/* Controls */}

      <section className="analytics-controls">
        <div className="analytics-season">
          <button
            type="button"
            className={
              selectedSeason === "2025"
                ? "analytics-season-button active"
                : "analytics-season-button"
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
                ? "analytics-season-button active"
                : "analytics-season-button"
            }
            onClick={() =>
              setSelectedSeason("2026")
            }
          >
            2026-27
          </button>
        </div>

        <span>
          {leagueName}
        </span>
      </section>

      {/* Loading */}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>

          <p>
            Loading analytics...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="error-card">
          <h2>
            Analytics unavailable
          </h2>

          <p>
            {error}
          </p>
        </div>
      )}

      {/* Analytics */}

      {!loading &&
        !error &&
        teams.length > 0 && (
          <>
            {/* Overview */}

            <section className="analytics-overview">
              <div className="analytics-stat-card">
                <span>
                  TEAMS
                </span>

                <strong>
                  {teams.length}
                </strong>

                <small>
                  Clubs in league
                </small>
              </div>

              <div className="analytics-stat-card">
                <span>
                  MATCHES
                </span>

                <strong>
                  {
                    statistics.totalMatches
                  }
                </strong>

                <small>
                  Matches played
                </small>
              </div>

              <div className="analytics-stat-card">
                <span>
                  TOTAL GOALS
                </span>

                <strong>
                  {
                    statistics.totalGoals
                  }
                </strong>

                <small>
                  Goals scored
                </small>
              </div>

              <div className="analytics-stat-card highlight">
                <span>
                  GOALS / MATCH
                </span>

                <strong>
                  {
                    statistics.averageGoals
                  }
                </strong>

                <small>
                  League average
                </small>
              </div>
            </section>

            {/* Leaders */}

            <section className="analytics-leaders">
              <div className="analytics-section-heading">
                <span>
                  LEAGUE LEADERS
                </span>

                <h2>
                  Performance Leaders
                </h2>
              </div>

              <div className="analytics-leader-grid">
                {/* Attack */}

                <div className="analytics-leader-card">
                  <span>
                    BEST ATTACK
                  </span>

                  <div className="leader-team">
                    {statistics.bestAttack
                      ?.team?.crest && (
                      <img
                        src={
                          statistics
                            .bestAttack
                            .team
                            .crest
                        }
                        alt=""
                      />
                    )}

                    <div>
                      <h3>
                        {
                          statistics
                            .bestAttack
                            ?.team
                            ?.name
                        }
                      </h3>

                      <p>
                        {
                          statistics
                            .bestAttack
                            ?.goalsFor
                        }{" "}
                        goals scored
                      </p>
                    </div>
                  </div>
                </div>

                {/* Defense */}

                <div className="analytics-leader-card">
                  <span>
                    BEST DEFENSE
                  </span>

                  <div className="leader-team">
                    {statistics.bestDefense
                      ?.team?.crest && (
                      <img
                        src={
                          statistics
                            .bestDefense
                            .team
                            .crest
                        }
                        alt=""
                      />
                    )}

                    <div>
                      <h3>
                        {
                          statistics
                            .bestDefense
                            ?.team
                            ?.name
                        }
                      </h3>

                      <p>
                        {
                          statistics
                            .bestDefense
                            ?.goalsAgainst
                        }{" "}
                        goals conceded
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wins */}

                <div className="analytics-leader-card">
                  <span>
                    MOST WINS
                  </span>

                  <div className="leader-team">
                    {statistics.mostWins
                      ?.team?.crest && (
                      <img
                        src={
                          statistics
                            .mostWins
                            .team
                            .crest
                        }
                        alt=""
                      />
                    )}

                    <div>
                      <h3>
                        {
                          statistics
                            .mostWins
                            ?.team
                            ?.name
                        }
                      </h3>

                      <p>
                        {
                          statistics
                            .mostWins
                            ?.won
                        }{" "}
                        wins
                      </p>
                    </div>
                  </div>
                </div>

                {/* Points */}

                <div className="analytics-leader-card">
                  <span>
                    MOST POINTS
                  </span>

                  <div className="leader-team">
                    {statistics
                      .highestPoints
                      ?.team?.crest && (
                      <img
                        src={
                          statistics
                            .highestPoints
                            .team
                            .crest
                        }
                        alt=""
                      />
                    )}

                    <div>
                      <h3>
                        {
                          statistics
                            .highestPoints
                            ?.team
                            ?.name
                        }
                      </h3>

                      <p>
                        {
                          statistics
                            .highestPoints
                            ?.points
                        }{" "}
                        points
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Points */}

            <section className="analytics-chart-section">
              <div className="analytics-section-heading">
                <span>
                  TABLE PERFORMANCE
                </span>

                <h2>
                  Points Distribution
                </h2>
              </div>

              <div className="analytics-bars">
                {sortedByPoints.map(
                  (item) => {
                    const maxPoints =
                      sortedByPoints[0]
                        ?.points || 1;

                    const percentage =
                      (item.points /
                        maxPoints) *
                      100;

                    return (
                      <div
                        className="analytics-bar-row"
                        key={item.team.id}
                      >
                        <div className="analytics-bar-label">
                          <span>
                            {item.position}
                          </span>

                          <strong>
                            {item.team
                              .shortName ||
                              item.team
                                .name}
                          </strong>
                        </div>

                        <div className="analytics-bar-track">
                          <div
                            className="analytics-bar-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>

                        <strong className="analytics-bar-value">
                          {item.points}
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            {/* Goals */}

            <section className="analytics-two-column">
              {/* Goals scored */}

              <div className="analytics-chart-section">
                <div className="analytics-section-heading">
                  <span>
                    ATTACK
                  </span>

                  <h2>
                    Goals Scored
                  </h2>
                </div>

                <div className="analytics-bars">
                  {sortedByGoals.map(
                    (item) => {
                      const maxGoals =
                        sortedByGoals[0]
                          ?.goalsFor || 1;

                      const percentage =
                        (item.goalsFor /
                          maxGoals) *
                        100;

                      return (
                        <div
                          className="analytics-bar-row"
                          key={
                            item.team.id
                          }
                        >
                          <div className="analytics-bar-label">
                            <span>
                              {item.position}
                            </span>

                            <strong>
                              {item.team
                                .shortName ||
                                item.team
                                  .name}
                            </strong>
                          </div>

                          <div className="analytics-bar-track">
                            <div
                              className="analytics-bar-fill"
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></div>
                          </div>

                          <strong className="analytics-bar-value">
                            {item.goalsFor}
                          </strong>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Goals conceded */}

              <div className="analytics-chart-section">
                <div className="analytics-section-heading">
                  <span>
                    DEFENSE
                  </span>

                  <h2>
                    Goals Conceded
                  </h2>
                </div>

                <div className="analytics-bars">
                  {sortedByConceded.map(
                    (item) => {
                      const maxGoals =
                        Math.max(
                          ...sortedByConceded.map(
                            (team) =>
                              team.goalsAgainst
                          )
                        ) || 1;

                      const percentage =
                        (item.goalsAgainst /
                          maxGoals) *
                        100;

                      return (
                        <div
                          className="analytics-bar-row"
                          key={
                            item.team.id
                          }
                        >
                          <div className="analytics-bar-label">
                            <span>
                              {item.position}
                            </span>

                            <strong>
                              {item.team
                                .shortName ||
                                item.team
                                  .name}
                            </strong>
                          </div>

                          <div className="analytics-bar-track">
                            <div
                              className="analytics-bar-fill"
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></div>
                          </div>

                          <strong className="analytics-bar-value">
                            {
                              item.goalsAgainst
                            }
                          </strong>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </section>

            {/* Win Rate */}

            <section className="analytics-chart-section analytics-winrate">
              <div className="analytics-section-heading">
                <span>
                  CONSISTENCY
                </span>

                <h2>
                  Win Rate
                </h2>
              </div>

              <div className="winrate-grid">
                {teams.map((team) => (
                  <div
                    className="winrate-card"
                    key={team.team.id}
                  >
                    <div className="winrate-team">
                      {team.team
                        .crest && (
                        <img
                          src={
                            team.team
                              .crest
                          }
                          alt=""
                        />
                      )}

                      <span>
                        {team.team
                          .shortName ||
                          team.team
                            .name}
                      </span>
                    </div>

                    <strong>
                      {getWinRate(team)}
                      %
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* Table */}

            <section className="analytics-table-section">
              <div className="analytics-section-heading">
                <span>
                  FULL DATA
                </span>

                <h2>
                  League Statistics
                </h2>
              </div>

              <div className="analytics-table">
                <div className="analytics-table-header">
                  <span>
                    #
                  </span>

                  <span>
                    TEAM
                  </span>

                  <span>
                    MP
                  </span>

                  <span>
                    W
                  </span>

                  <span>
                    D
                  </span>

                  <span>
                    L
                  </span>

                  <span>
                    GF
                  </span>

                  <span>
                    GA
                  </span>

                  <span>
                    GD
                  </span>

                  <span>
                    PTS
                  </span>
                </div>

                {teams.map((team) => (
                  <div
                    className="analytics-table-row"
                    key={team.team.id}
                  >
                    <span>
                      {team.position}
                    </span>

                    <div className="analytics-table-team">
                      {team.team
                        .crest && (
                        <img
                          src={
                            team.team
                              .crest
                          }
                          alt=""
                        />
                      )}

                      <strong>
                        {team.team
                          .shortName ||
                          team.team
                            .name}
                      </strong>
                    </div>

                    <span>
                      {
                        team.playedGames
                      }
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
                      {team.goalsFor}
                    </span>

                    <span>
                      {
                        team.goalsAgainst
                      }
                    </span>

                    <span>
                      {
                        team.goalDifference
                      }
                    </span>

                    <strong>
                      {team.points}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
    </main>
  );
}

export default Analytics;