import { useEffect, useMemo, useState } from "react";

import {
  getCompetitionMatches,
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

const statusFilters = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "SCHEDULED",
    label: "Upcoming",
  },
  {
    value: "LIVE",
    label: "Live",
  },
  {
    value: "FINISHED",
    label: "Finished",
  },
];

function Matches() {
  const [selectedLeague, setSelectedLeague] =
    useState("PL");

  const [selectedSeason, setSelectedSeason] =
    useState("2026");

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const [matches, setMatches] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getCompetitionMatches(
            selectedLeague,
            selectedSeason
          );

        setMatches(data.matches || []);
      } catch (err) {
        console.error(
          "Failed to load matches:",
          err
        );

        setError(
          err.message ||
            "Unable to load matches."
        );

        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [selectedLeague, selectedSeason]);

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    /*
     * Status filter
     */

    if (selectedStatus === "LIVE") {
      result = result.filter(
        (match) =>
          match.status === "IN_PLAY" ||
          match.status === "PAUSED"
      );
    }

    if (selectedStatus === "SCHEDULED") {
      result = result.filter(
        (match) =>
          match.status === "SCHEDULED" ||
          match.status === "TIMED"
      );
    }

    if (selectedStatus === "FINISHED") {
      result = result.filter(
        (match) =>
          match.status === "FINISHED"
      );
    }

    /*
     * Search
     */

    const searchValue = search
      .trim()
      .toLowerCase();

    if (searchValue) {
      result = result.filter((match) => {
        const home =
          match.homeTeam?.name ||
          "";

        const away =
          match.awayTeam?.name ||
          "";

        return (
          home
            .toLowerCase()
            .includes(searchValue) ||
          away
            .toLowerCase()
            .includes(searchValue)
        );
      });
    }

    /*
     * Sort by date
     */

    result.sort(
      (a, b) =>
        new Date(a.utcDate) -
        new Date(b.utcDate)
    );

    return result;
  }, [
    matches,
    selectedStatus,
    search,
  ]);

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) {
      return "--:--";
    }

    return new Date(date).toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "FINISHED":
        return "Finished";

      case "IN_PLAY":
        return "Live";

      case "PAUSED":
        return "Half Time";

      case "POSTPONED":
        return "Postponed";

      case "CANCELLED":
        return "Cancelled";

      case "SUSPENDED":
        return "Suspended";

      case "TIMED":
      case "SCHEDULED":
        return "Upcoming";

      default:
        return status || "Unknown";
    }
  };

  const isLive = (status) => {
    return (
      status === "IN_PLAY" ||
      status === "PAUSED"
    );
  };

  const isFinished = (status) => {
    return status === "FINISHED";
  };

  const getScore = (
    match,
    side
  ) => {
    if (
      !isFinished(match.status) &&
      !isLive(match.status)
    ) {
      return "-";
    }

    return (
      match.score?.fullTime?.[side] ??
      match.score?.halfTime?.[side] ??
      "-"
    );
  };

  const leagueName =
    leagues.find(
      (league) =>
        league.code === selectedLeague
    )?.name || "";

  return (
    <main className="page matches-page">
      {/* Header */}

      <div className="page-header">
        <div>
          <span className="section-label">
            FIXTURES & RESULTS
          </span>

          <h1>Matches</h1>

          <p>
            Follow fixtures, results and live
            match information.
          </p>
        </div>
      </div>

      {/* League selector */}

      <section className="matches-leagues">
        {leagues.map((league) => (
          <button
            key={league.code}
            type="button"
            className={
              selectedLeague ===
              league.code
                ? "matches-league active"
                : "matches-league"
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

      <section className="matches-controls">
        <div className="matches-seasons">
          <button
            type="button"
            className={
              selectedSeason === "2025"
                ? "matches-season active"
                : "matches-season"
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
                ? "matches-season active"
                : "matches-season"
            }
            onClick={() =>
              setSelectedSeason("2026")
            }
          >
            2026-27
          </button>
        </div>

        <div className="matches-status">
          {statusFilters.map(
            (filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  selectedStatus ===
                  filter.value
                    ? "matches-status-button active"
                    : "matches-status-button"
                }
                onClick={() =>
                  setSelectedStatus(
                    filter.value
                  )
                }
              >
                {filter.label}
              </button>
            )
          )}
        </div>

        <div className="matches-search">
          <input
            type="text"
            placeholder="Search club..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>
      </section>

      {/* Match section */}

      <section className="matches-content">
        <div className="matches-content-header">
          <div>
            <span className="section-label">
              {leagueName}
            </span>

            <h2>
              Match Centre
            </h2>
          </div>

          <span>
            {filteredMatches.length} matches
          </span>
        </div>

        {/* Loading */}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>

            <p>
              Loading matches...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="error-card">
            <h2>
              Matches unavailable
            </h2>

            <p>
              {error}
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          filteredMatches.length ===
            0 && (
            <div className="empty-state">
              <h3>
                No matches found
              </h3>

              <p>
                Try changing the league,
                season, status or search.
              </p>
            </div>
          )}

        {/* Match list */}

        {!loading &&
          !error &&
          filteredMatches.length >
            0 && (
            <div className="matches-list">
              {filteredMatches.map(
                (match) => {
                  const status =
                    match.status;

                  const live =
                    isLive(status);

                  const finished =
                    isFinished(status);

                  return (
                    <article
                      className={
                        live
                          ? "match-card live"
                          : "match-card"
                      }
                      key={match.id}
                    >
                      {/* Date */}

                      <div className="match-date">
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

                      {/* Home */}

                      <div className="match-team home">
                        <div>
                          <span>
                            HOME
                          </span>

                          <h3>
                            {
                              match
                                .homeTeam
                                ?.shortName ||
                              match
                                .homeTeam
                                ?.name ||
                              "Home Team"
                            }
                          </h3>
                        </div>

                        {match.homeTeam
                          ?.crest && (
                          <img
                            src={
                              match
                                .homeTeam
                                .crest
                            }
                            alt={`${match.homeTeam.name} crest`}
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Score */}

                      <div className="match-score">
                        {live && (
                          <span className="live-badge">
                            LIVE
                          </span>
                        )}

                        <div className="score">
                          <strong>
                            {getScore(
                              match,
                              "home"
                            )}
                          </strong>

                          <span>
                            -
                          </span>

                          <strong>
                            {getScore(
                              match,
                              "away"
                            )}
                          </strong>
                        </div>

                        <span
                          className={
                            live
                              ? "match-status live-status"
                              : "match-status"
                          }
                        >
                          {getStatusLabel(
                            status
                          )}
                        </span>
                      </div>

                      {/* Away */}

                      <div className="match-team away">
                        {match.awayTeam
                          ?.crest && (
                          <img
                            src={
                              match
                                .awayTeam
                                .crest
                            }
                            alt={`${match.awayTeam.name} crest`}
                            loading="lazy"
                          />
                        )}

                        <div>
                          <span>
                            AWAY
                          </span>

                          <h3>
                            {
                              match
                                .awayTeam
                                ?.shortName ||
                              match
                                .awayTeam
                                ?.name ||
                              "Away Team"
                            }
                          </h3>
                        </div>
                      </div>

                      {/* Competition */}

                      <div className="match-competition">
                        <span>
                          {match.stage ||
                            match
                              .competition
                              ?.name ||
                            leagueName}
                        </span>

                        {match.matchday && (
                          <small>
                            Matchday{" "}
                            {
                              match.matchday
                            }
                          </small>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
      </section>
    </main>
  );
}

export default Matches;