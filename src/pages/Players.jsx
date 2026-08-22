import { useEffect, useMemo, useState } from "react";

import { getCompetitionScorers } from "../services/footballApi";

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

function Players() {
  const [selectedLeague, setSelectedLeague] = useState("PL");
  const [selectedSeason, setSelectedSeason] = useState("2025");

  const [players, setPlayers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCompetitionScorers(
          selectedLeague,
          selectedSeason
        );

        setPlayers(data.scorers || []);
      } catch (err) {
        console.error("Players error:", err);

        setError(
          err.message || "Unable to load player data."
        );

        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [selectedLeague, selectedSeason]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return players;
    }

    return players.filter((item) => {
      const playerName =
        item.player?.name?.toLowerCase() || "";

      const teamName =
        item.team?.name?.toLowerCase() || "";

      return (
        playerName.includes(query) ||
        teamName.includes(query)
      );
    });
  }, [players, search]);

  const topScorer = useMemo(() => {
    return [...players].sort(
      (a, b) => (b.goals || 0) - (a.goals || 0)
    )[0];
  }, [players]);

  const totalGoals = useMemo(() => {
    return players.reduce(
      (total, player) =>
        total + (player.goals || 0),
      0
    );
  }, [players]);

  const totalAssists = useMemo(() => {
    return players.reduce(
      (total, player) =>
        total + (player.assists || 0),
      0
    );
  }, [players]);

  const leagueName =
    leagues.find(
      (league) => league.code === selectedLeague
    )?.name || "";

  return (
    <main className="page players-page">
      {/* Header */}

      <div className="page-header players-header">
        <div>
          <span className="section-label">
            PLAYER DATABASE
          </span>

          <h1>Players</h1>

          <p>
            Explore player performances, goals
            and assists across Europe's top leagues.
          </p>
        </div>
      </div>

      {/* League selector */}

      <section className="players-leagues">
        {leagues.map((league) => (
          <button
            type="button"
            key={league.code}
            className={
              selectedLeague === league.code
                ? "players-league active"
                : "players-league"
            }
            onClick={() =>
              setSelectedLeague(league.code)
            }
          >
            <strong>{league.name}</strong>

            <span>{league.country}</span>
          </button>
        ))}
      </section>

      {/* Controls */}

      <section className="players-controls">
        <div className="players-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search player or club..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="players-season">
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
      </section>

      {/* Loading */}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>

          <p>Loading players...</p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="error-card">
          <h2>Players unavailable</h2>

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
        players.length > 0 && (
          <>
            {/* Summary */}

            <section className="players-summary">
              <div className="players-stat">
                <span>PLAYERS</span>

                <strong>{players.length}</strong>

                <small>
                  Players returned by API
                </small>
              </div>

              <div className="players-stat">
                <span>TOTAL GOALS</span>

                <strong>{totalGoals}</strong>

                <small>
                  Goals in scorer dataset
                </small>
              </div>

              <div className="players-stat">
                <span>TOTAL ASSISTS</span>

                <strong>{totalAssists}</strong>

                <small>
                  Recorded assists
                </small>
              </div>

              <div className="players-stat highlight">
                <span>TOP SCORER</span>

                <strong>
                  {topScorer?.goals || 0}
                </strong>

                <small>
                  {topScorer?.player?.name ||
                    "No player"}
                </small>
              </div>
            </section>

            {/* Top scorer */}

            {topScorer && (
              <section className="featured-player">
                <div className="featured-player-info">
                  <span>LEAGUE TOP SCORER</span>

                  <h2>
                    {topScorer.player?.name}
                  </h2>

                  <p>
                    {topScorer.team?.name ||
                      "Unknown club"}
                  </p>

                  <div className="featured-player-stats">
                    <div>
                      <strong>
                        {topScorer.goals || 0}
                      </strong>

                      <span>GOALS</span>
                    </div>

                    <div>
                      <strong>
                        {topScorer.assists || 0}
                      </strong>

                      <span>ASSISTS</span>
                    </div>

                    <div>
                      <strong>
                        {topScorer.appearances || 0}
                      </strong>

                      <span>APPEARANCES</span>
                    </div>
                  </div>
                </div>

                <div className="featured-player-club">
                  {topScorer.team?.crest && (
                    <img
                      src={topScorer.team.crest}
                      alt=""
                    />
                  )}

                  <span>
                    {topScorer.team?.shortName ||
                      topScorer.team?.name}
                  </span>
                </div>
              </section>
            )}

            {/* Player list */}

            <section className="players-list-section">
              <div className="players-section-heading">
                <div>
                  <span>
                    {leagueName.toUpperCase()}
                  </span>

                  <h2>Player Statistics</h2>
                </div>

                <span>
                  {filteredPlayers.length} players
                </span>
              </div>

              {filteredPlayers.length === 0 ? (
                <div className="players-empty">
                  <h3>No players found</h3>

                  <p>
                    Try a different player or club
                    name.
                  </p>
                </div>
              ) : (
                <div className="players-table">
                  <div className="players-table-header">
                    <span>#</span>

                    <span>PLAYER</span>

                    <span>TEAM</span>

                    <span>APP</span>

                    <span>GOALS</span>

                    <span>ASSISTS</span>
                  </div>

                  {filteredPlayers.map(
                    (item, index) => (
                      <div
                        className="players-table-row"
                        key={
                          item.player?.id ||
                          `${item.player?.name}-${index}`
                        }
                      >
                        <span className="player-rank">
                          {index + 1}
                        </span>

                        <div className="player-name-cell">
                          {item.player?.image ? (
                            <img
                              src={
                                item.player.image
                              }
                              alt=""
                            />
                          ) : (
                            <div className="player-avatar">
                              {item.player?.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "P"}
                            </div>
                          )}

                          <div>
                            <strong>
                              {item.player?.name ||
                                "Unknown player"}
                            </strong>

                            <span>
                              {item.player?.nationality ||
                                "Player"}
                            </span>
                          </div>
                        </div>

                        <div className="player-team-cell">
                          {item.team?.crest && (
                            <img
                              src={item.team.crest}
                              alt=""
                            />
                          )}

                          <span>
                            {item.team?.shortName ||
                              item.team?.name ||
                              "-"}
                          </span>
                        </div>

                        <span>
                          {item.appearances ?? "-"}
                        </span>

                        <strong className="player-goals">
                          {item.goals || 0}
                        </strong>

                        <span>
                          {item.assists ?? "-"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}

      {!loading &&
        !error &&
        players.length === 0 && (
          <div className="players-empty">
            <h3>No player data available</h3>

            <p>
              Try another competition or season.
            </p>
          </div>
        )}
    </main>
  );
}

export default Players;