import { useEffect, useMemo, useState } from "react";

import { getCompetitionStandings } from "../services/footballApi";

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

function Comparison() {
  const [selectedLeague, setSelectedLeague] = useState("PL");
  const [selectedSeason, setSelectedSeason] = useState("2026");

  const [teams, setTeams] = useState([]);

  const [teamOneId, setTeamOneId] = useState("");
  const [teamTwoId, setTeamTwoId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCompetitionStandings(
          selectedLeague,
          selectedSeason
        );

        const table =
          data.standings?.find(
            (standing) => standing.type === "TOTAL"
          )?.table || [];

        const teamData = table.map((item) => ({
          ...item.team,
          position: item.position,
          points: item.points,
          playedGames: item.playedGames,
          won: item.won,
          draw: item.draw,
          lost: item.lost,
          goalsFor: item.goalsFor,
          goalsAgainst: item.goalsAgainst,
          goalDifference: item.goalDifference,
        }));

        setTeams(teamData);

        setTeamOneId(
          teamData[0]?.id
            ? String(teamData[0].id)
            : ""
        );

        setTeamTwoId(
          teamData[1]?.id
            ? String(teamData[1].id)
            : ""
        );
      } catch (err) {
        console.error("Comparison error:", err);

        setError(
          err.message ||
            "Unable to load comparison data."
        );

        setTeams([]);
        setTeamOneId("");
        setTeamTwoId("");
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [selectedLeague, selectedSeason]);

  const teamOne = useMemo(
    () =>
      teams.find(
        (team) => String(team.id) === teamOneId
      ),
    [teams, teamOneId]
  );

  const teamTwo = useMemo(
    () =>
      teams.find(
        (team) => String(team.id) === teamTwoId
      ),
    [teams, teamTwoId]
  );

  const getWinPercentage = (team) => {
    if (!team || !team.playedGames) {
      return 0;
    }

    return (
      (team.won / team.playedGames) *
      100
    ).toFixed(1);
  };

  const getGoalsPerMatch = (team) => {
    if (!team || !team.playedGames) {
      return "0.00";
    }

    return (
      team.goalsFor / team.playedGames
    ).toFixed(2);
  };

  const comparisonRows = [
    {
      label: "League Position",
      key: "position",
    },
    {
      label: "Points",
      key: "points",
    },
    {
      label: "Matches Played",
      key: "playedGames",
    },
    {
      label: "Wins",
      key: "won",
    },
    {
      label: "Draws",
      key: "draw",
    },
    {
      label: "Losses",
      key: "lost",
    },
    {
      label: "Goals Scored",
      key: "goalsFor",
    },
    {
      label: "Goals Conceded",
      key: "goalsAgainst",
    },
    {
      label: "Goal Difference",
      key: "goalDifference",
    },
  ];

  const getBetter = (key) => {
    if (!teamOne || !teamTwo) {
      return null;
    }

    if (teamOne[key] === teamTwo[key]) {
      return "equal";
    }

    if (key === "position" || key === "goalsAgainst" || key === "lost") {
      return teamOne[key] < teamTwo[key]
        ? "one"
        : "two";
    }

    return teamOne[key] > teamTwo[key]
      ? "one"
      : "two";
  };

  const leagueName =
    leagues.find(
      (league) => league.code === selectedLeague
    )?.name || "";

  return (
    <main className="page comparison-page">
      {/* Header */}

      <div className="page-header">
        <div>
          <span className="section-label">
            HEAD TO HEAD
          </span>

          <h1>Comparison</h1>

          <p>
            Compare the performance of two clubs
            from Europe's top leagues.
          </p>
        </div>
      </div>

      {/* League Selector */}

      <section className="comparison-leagues">
        {leagues.map((league) => (
          <button
            key={league.code}
            type="button"
            className={
              selectedLeague === league.code
                ? "comparison-league active"
                : "comparison-league"
            }
            onClick={() =>
              setSelectedLeague(league.code)
            }
          >
            {league.name}
          </button>
        ))}
      </section>

      {/* Season */}

      <section className="comparison-controls">
        <div className="comparison-season">
          <button
            type="button"
            className={
              selectedSeason === "2025"
                ? "comparison-season-button active"
                : "comparison-season-button"
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
                ? "comparison-season-button active"
                : "comparison-season-button"
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
            Loading teams...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="error-card">
          <h2>
            Comparison unavailable
          </h2>

          <p>{error}</p>
        </div>
      )}

      {/* Comparison */}

      {!loading &&
        !error &&
        teams.length > 0 && (
          <>
            {/* Team Selectors */}

            <section className="comparison-selectors">
              <div className="comparison-team-selector">
                <label>
                  TEAM 01
                </label>

                <select
                  value={teamOneId}
                  onChange={(event) =>
                    setTeamOneId(
                      event.target.value
                    )
                  }
                >
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                    >
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="comparison-vs">
                VS
              </div>

              <div className="comparison-team-selector">
                <label>
                  TEAM 02
                </label>

                <select
                  value={teamTwoId}
                  onChange={(event) =>
                    setTeamTwoId(
                      event.target.value
                    )
                  }
                >
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                    >
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Team Headers */}

            {teamOne && teamTwo && (
              <section className="comparison-teams">
                <div className="comparison-team">
                  <div className="comparison-crest">
                    {teamOne.crest ? (
                      <img
                        src={teamOne.crest}
                        alt={`${teamOne.name} crest`}
                      />
                    ) : (
                      <span>
                        {teamOne.tla}
                      </span>
                    )}
                  </div>

                  <span>
                    {teamOne.tla}
                  </span>

                  <h2>
                    {teamOne.name}
                  </h2>

                  <small>
                    Position #{teamOne.position}
                  </small>
                </div>

                <div className="comparison-center">
                  <span>
                    TEAM
                  </span>

                  <strong>
                    VS
                  </strong>
                </div>

                <div className="comparison-team">
                  <div className="comparison-crest">
                    {teamTwo.crest ? (
                      <img
                        src={teamTwo.crest}
                        alt={`${teamTwo.name} crest`}
                      />
                    ) : (
                      <span>
                        {teamTwo.tla}
                      </span>
                    )}
                  </div>

                  <span>
                    {teamTwo.tla}
                  </span>

                  <h2>
                    {teamTwo.name}
                  </h2>

                  <small>
                    Position #{teamTwo.position}
                  </small>
                </div>
              </section>
            )}

            {/* Statistics */}

            {teamOne && teamTwo && (
              <section className="comparison-stats">
                <div className="comparison-stats-header">
                  <span>
                    PERFORMANCE
                  </span>

                  <h2>
                    Statistical Comparison
                  </h2>
                </div>

                {comparisonRows.map((row) => {
                  const better = getBetter(
                    row.key
                  );

                  return (
                    <div
                      className="comparison-row"
                      key={row.key}
                    >
                      <strong
                        className={
                          better === "one"
                            ? "better"
                            : ""
                        }
                      >
                        {teamOne[row.key]}
                      </strong>

                      <span>
                        {row.label}
                      </span>

                      <strong
                        className={
                          better === "two"
                            ? "better"
                            : ""
                        }
                      >
                        {teamTwo[row.key]}
                      </strong>
                    </div>
                  );
                })}

                <div className="comparison-row">
                  <strong
                    className={
                      Number(
                        getWinPercentage(
                          teamOne
                        )
                      ) >
                      Number(
                        getWinPercentage(
                          teamTwo
                        )
                      )
                        ? "better"
                        : ""
                    }
                  >
                    {getWinPercentage(
                      teamOne
                    )}
                    %
                  </strong>

                  <span>
                    Win Percentage
                  </span>

                  <strong
                    className={
                      Number(
                        getWinPercentage(
                          teamTwo
                        )
                      ) >
                      Number(
                        getWinPercentage(
                          teamOne
                        )
                      )
                        ? "better"
                        : ""
                    }
                  >
                    {getWinPercentage(
                      teamTwo
                    )}
                    %
                  </strong>
                </div>

                <div className="comparison-row">
                  <strong
                    className={
                      Number(
                        getGoalsPerMatch(
                          teamOne
                        )
                      ) >
                      Number(
                        getGoalsPerMatch(
                          teamTwo
                        )
                      )
                        ? "better"
                        : ""
                    }
                  >
                    {getGoalsPerMatch(
                      teamOne
                    )}
                  </strong>

                  <span>
                    Goals / Match
                  </span>

                  <strong
                    className={
                      Number(
                        getGoalsPerMatch(
                          teamTwo
                        )
                      ) >
                      Number(
                        getGoalsPerMatch(
                          teamOne
                        )
                      )
                        ? "better"
                        : ""
                    }
                  >
                    {getGoalsPerMatch(
                      teamTwo
                    )}
                  </strong>
                </div>
              </section>
            )}

            {/* Summary */}

            {teamOne && teamTwo && (
              <section className="comparison-summary">
                <span className="section-label">
                  QUICK SUMMARY
                </span>

                <h2>
                  {teamOne.name} vs{" "}
                  {teamTwo.name}
                </h2>

                <div className="comparison-summary-grid">
                  <div>
                    <span>
                      POINTS DIFFERENCE
                    </span>

                    <strong>
                      {Math.abs(
                        teamOne.points -
                          teamTwo.points
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      GOAL DIFFERENCE GAP
                    </span>

                    <strong>
                      {Math.abs(
                        teamOne.goalDifference -
                          teamTwo.goalDifference
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      GOALS SCORED GAP
                    </span>

                    <strong>
                      {Math.abs(
                        teamOne.goalsFor -
                          teamTwo.goalsFor
                      )}
                    </strong>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
    </main>
  );
}

export default Comparison;