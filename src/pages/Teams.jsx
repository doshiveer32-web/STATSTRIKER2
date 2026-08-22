import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    name: "La Liga",
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

function Teams() {
  const [selectedLeague, setSelectedLeague] =
    useState("PL");

  const [teams, setTeams] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const selectedLeagueData =
    leagues.find(
      (league) => league.code === selectedLeague
    );

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getCompetitionStandings(
            selectedLeague,
            2026
          );

        const table =
          data?.standings?.[0]?.table || [];

        const teamList = table.map((item) => ({
          position: item.position,
          team: item.team,
          played: item.playedGames,
          points: item.points,
          won: item.won,
          draw: item.draw,
          lost: item.lost,
          goalsFor: item.goalsFor,
          goalsAgainst: item.goalsAgainst,
          goalDifference: item.goalDifference,
        }));

        setTeams(teamList);
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load teams."
        );

        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [selectedLeague]);

  return (
    <main className="page-content">
      {/* Page heading */}
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            FOOTBALL DATABASE
          </div>

          <h1>Teams</h1>

          <p>
            Explore clubs from Europe's top five
            football leagues.
          </p>
        </div>
      </section>

      {/* League selector */}
      <section className="league-selector">
        {leagues.map((league) => (
          <button
            key={league.code}
            type="button"
            className={`league-card ${
              selectedLeague === league.code
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setSelectedLeague(
                league.code
              )
            }
          >
            <strong>{league.name}</strong>

            <span>{league.country}</span>
          </button>
        ))}
      </section>

      {/* Team heading */}
      <section className="teams-section">
        <div className="teams-section-header">
          <h2>
            {loading
              ? "Loading teams..."
              : `${teams.length} teams`}
          </h2>

          <span>
            {selectedLeagueData?.name}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            <strong>
              Unable to load teams
            </strong>

            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="loading-state">
            Loading teams...
          </div>
        )}

        {/* Teams */}
        {!loading &&
          !error &&
          teams.length > 0 && (
            <div className="teams-grid">
              {teams.map((item) => {
                const team = item.team;

                return (
                  <Link
                    key={team.id}
                    to={`/teams/${team.id}`}
                    className="team-card"
                  >
                    <div className="team-logo-wrapper">
                      {team.crest ? (
                        <img
                          src={team.crest}
                          alt={`${team.name} logo`}
                          className="team-logo"
                        />
                      ) : (
                        <div className="team-logo-placeholder">
                          {team.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="team-info">
                      <h3>
                        {team.name}
                      </h3>

                      <p>
                        {team.shortName ||
                          team.tla ||
                          ""}
                      </p>

                      <span className="team-code">
                        {team.tla || "TEAM"}
                      </span>
                    </div>

                    <div className="team-arrow">
                      →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        {/* Empty */}
        {!loading &&
          !error &&
          teams.length === 0 && (
            <div className="empty-state">
              No teams found for this
              competition.
            </div>
          )}
      </section>
    </main>
  );
}

export default Teams;