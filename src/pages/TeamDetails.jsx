import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getTeam,
  getTeamMatches,
} from "../services/footballApi";

function TeamDetails() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        setError("");

        const [teamData, matchesData] =
          await Promise.all([
            getTeam(id),
            getTeamMatches(id),
          ]);

        setTeam(teamData);
        setMatches(matchesData.matches || []);
      } catch (err) {
        console.error("Team details error:", err);

        setError(
          err.message ||
            "Unable to load team information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [id]);

  const recentMatches = useMemo(() => {
    return matches
      .filter(
        (match) =>
          match.status === "FINISHED"
      )
      .sort(
        (a, b) =>
          new Date(b.utcDate) -
          new Date(a.utcDate)
      )
      .slice(0, 8);
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    return matches
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
      .slice(0, 6);
  }, [matches]);

  const squad = team?.squad || [];

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
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
    return (
      match.score?.fullTime?.[side] ??
      "-"
    );
  };

  const isHomeTeam =
    (match) =>
      Number(match.homeTeam?.id) ===
      Number(id);

  const getResult = (match) => {
    const homeScore =
      match.score?.fullTime?.home;

    const awayScore =
      match.score?.fullTime?.away;

    if (
      homeScore === null ||
      homeScore === undefined ||
      awayScore === null ||
      awayScore === undefined
    ) {
      return "";
    }

    const teamIsHome =
      isHomeTeam(match);

    const teamScore = teamIsHome
      ? homeScore
      : awayScore;

    const opponentScore = teamIsHome
      ? awayScore
      : homeScore;

    if (teamScore > opponentScore) {
      return "W";
    }

    if (teamScore < opponentScore) {
      return "L";
    }

    return "D";
  };

  if (loading) {
    return (
      <main className="page team-details-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>

          <p>Loading team...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page team-details-page">
        <div className="error-card">
          <h2>
            Team unavailable
          </h2>

          <p>{error}</p>

          <Link to="/teams">
            Back to teams
          </Link>
        </div>
      </main>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <main className="page team-details-page">
      {/* Back */}

      <Link
        to="/teams"
        className="team-back-link"
      >
        ← Back to Teams
      </Link>

      {/* Hero */}

      <section className="team-hero">
        <div className="team-hero-left">
          <div className="team-crest-large">
            {team.crest && (
              <img
                src={team.crest}
                alt={team.name}
              />
            )}
          </div>

          <div>
            <span className="section-label">
              CLUB PROFILE
            </span>

            <h1>{team.name}</h1>

            <p>
              {team.shortName ||
                team.tla ||
                "Football Club"}
            </p>

            {team.area?.name && (
              <span className="team-country">
                {team.area.name}
              </span>
            )}
          </div>
        </div>

        {team.website && (
          <a
            href={team.website}
            target="_blank"
            rel="noreferrer"
            className="team-website"
          >
            Official Website ↗
          </a>
        )}
      </section>

      {/* Club information */}

      <section className="team-info-grid">
        <div className="team-info-card">
          <span>
            FOUNDED
          </span>

          <strong>
            {team.founded || "-"}
          </strong>
        </div>

        <div className="team-info-card">
          <span>
            STADIUM
          </span>

          <strong>
            {team.venue || "-"}
          </strong>
        </div>

        <div className="team-info-card">
          <span>
            CITY
          </span>

          <strong>
            {team.area?.name || "-"}
          </strong>
        </div>

        <div className="team-info-card">
          <span>
            CLUB CODE
          </span>

          <strong>
            {team.tla || "-"}
          </strong>
        </div>
      </section>

      {/* Main content */}

      <section className="team-details-grid">
        {/* Recent matches */}

        <div className="team-panel">
          <div className="team-panel-header">
            <div>
              <span>
                RESULTS
              </span>

              <h2>
                Recent Matches
              </h2>
            </div>

            <Link to="/matches">
              Match Centre
            </Link>
          </div>

          <div className="team-match-list">
            {recentMatches.length ===
              0 && (
              <div className="team-empty">
                No recent matches available.
              </div>
            )}

            {recentMatches.map(
              (match) => {
                const result =
                  getResult(match);

                return (
                  <div
                    className="team-match-row"
                    key={match.id}
                  >
                    <div className="team-match-date">
                      <strong>
                        {formatDate(
                          match.utcDate
                        )}
                      </strong>

                      <span>
                        {result}
                      </span>
                    </div>

                    <div className="team-match-club">
                      {match.homeTeam
                        ?.crest && (
                        <img
                          src={
                            match
                              .homeTeam
                              .crest
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

                    <div className="team-match-score">
                      <strong>
                        {getScore(
                          match,
                          "home"
                        )}
                      </strong>

                      <span>-</span>

                      <strong>
                        {getScore(
                          match,
                          "away"
                        )}
                      </strong>
                    </div>

                    <div className="team-match-club away">
                      <span>
                        {
                          match.awayTeam
                            ?.shortName
                        }
                      </span>

                      {match.awayTeam
                        ?.crest && (
                        <img
                          src={
                            match
                              .awayTeam
                              .crest
                          }
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Upcoming */}

        <div className="team-panel">
          <div className="team-panel-header">
            <div>
              <span>
                FIXTURES
              </span>

              <h2>
                Upcoming Matches
              </h2>
            </div>

            <Link to="/matches">
              All Matches
            </Link>
          </div>

          <div className="team-match-list">
            {upcomingMatches.length ===
              0 && (
              <div className="team-empty">
                No upcoming matches available.
              </div>
            )}

            {upcomingMatches.map(
              (match) => (
                <div
                  className="upcoming-team-match"
                  key={match.id}
                >
                  <div className="upcoming-date">
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

                  <div className="upcoming-club">
                    {match.homeTeam
                      ?.crest && (
                      <img
                        src={
                          match.homeTeam
                            .crest
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

                  <span className="upcoming-vs">
                    VS
                  </span>

                  <div className="upcoming-club">
                    <span>
                      {
                        match.awayTeam
                          ?.shortName
                      }
                    </span>

                    {match.awayTeam
                      ?.crest && (
                      <img
                        src={
                          match.awayTeam
                            .crest
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

      {/* Squad */}

      <section className="team-panel squad-panel">
        <div className="team-panel-header">
          <div>
            <span>
              FIRST TEAM
            </span>

            <h2>
              Squad
            </h2>
          </div>

          <span>
            {squad.length} players
          </span>
        </div>

        {squad.length === 0 ? (
          <div className="team-empty">
            Squad information is not available
            for this team.
          </div>
        ) : (
          <div className="squad-grid">
            {squad.map((player) => (
              <div
                className="squad-card"
                key={
                  player.id ||
                  player.name
                }
              >
                <div className="squad-avatar">
                  {player.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "P"}
                </div>

                <div>
                  <strong>
                    {player.name}
                  </strong>

                  <span>
                    {player.position ||
                      "Player"}
                  </span>

                  {player.nationality && (
                    <small>
                      {player.nationality}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default TeamDetails;