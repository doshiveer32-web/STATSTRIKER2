import { useEffect, useState } from "react";
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

function Competitions() {
  const [selectedLeague, setSelectedLeague] = useState("PL");
  const [selectedSeason, setSelectedSeason] = useState("2026");

  const [standings, setStandings] = useState([]);
  const [competitionName, setCompetitionName] =
    useState("Premier League");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const selected = leagues.find(
      (league) => league.code === selectedLeague
    );

    setCompetitionName(selected?.name || "");
  }, [selectedLeague]);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCompetitionStandings(
          selectedLeague,
          selectedSeason
        );

        const table =
          data.standings?.find(
            (standing) =>
              standing.type === "TOTAL"
          )?.table || [];

        setStandings(table);
      } catch (err) {
        console.error(
          "Failed to load standings:",
          err
        );

        setError(
          "Unable to load standings for this competition."
        );

        setStandings([]);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, [selectedLeague, selectedSeason]);

  const getPositionClass = (position) => {
    if (position <= 4) {
      return "champions-league";
    }

    if (position === 5) {
      return "europa-league";
    }

    if (position >= 18) {
      return "relegation";
    }

    return "";
  };

  return (
    <main className="page competitions-page">
      {/* Header */}

      <div className="page-header">
        <div>
          <span className="section-label">
            COMPETITIONS
          </span>

          <h1>League Tables</h1>

          <p>
            Follow standings from Europe's top five
            football leagues.
          </p>
        </div>
      </div>

      {/* League Selector */}

      <section className="competition-leagues">
        {leagues.map((league) => (
          <button
            key={league.code}
            type="button"
            className={
              selectedLeague === league.code
                ? "competition-league active"
                : "competition-league"
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

      {/* Season Controls */}

      <section className="competition-controls">
        <div>
          <span className="section-label">
            CURRENT COMPETITION
          </span>

          <h2>{competitionName}</h2>
        </div>

        <div className="competition-season">
          <button
            type="button"
            className={
              selectedSeason === "2025"
                ? "season-button active"
                : "season-button"
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
                ? "season-button active"
                : "season-button"
            }
            onClick={() =>
              setSelectedSeason("2026")
            }
          >
            2026-27
          </button>
        </div>
      </section>

      {/* Standings */}

      <section className="standings-section">
        <div className="standings-header">
          <div>
            <span className="section-label">
              {selectedSeason === "2025"
                ? "2025-26 SEASON"
                : "2026-27 SEASON"}
            </span>

            <h2>{competitionName}</h2>
          </div>

          <span>
            {standings.length} teams
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>

            <p>Loading league table...</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <h2>Unable to load table</h2>

            <p>{error}</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="empty-state">
            <h3>No standings available</h3>

            <p>
              There is currently no standings data
              available for this season.
            </p>
          </div>
        ) : (
          <div className="standings-wrapper">
            <div className="standings-table">
              {/* Table Header */}

              <div className="standings-row standings-heading">
                <div>POS</div>
                <div>TEAM</div>
                <div>P</div>
                <div>W</div>
                <div>D</div>
                <div>L</div>
                <div>GF</div>
                <div>GA</div>
                <div>GD</div>
                <div>PTS</div>
              </div>

              {/* Teams */}

              {standings.map((team) => (
                <div
                  className="standings-row"
                  key={team.team.id}
                >
                  <div
                    className={`position ${getPositionClass(
                      team.position
                    )}`}
                  >
                    {team.position}
                  </div>

                  <div className="standing-team">
                    {team.team.crest && (
                      <img
                        src={team.team.crest}
                        alt={`${team.team.name} crest`}
                      />
                    )}

                    <span>
                      {team.team.name}
                    </span>
                  </div>

                  <div>{team.playedGames}</div>

                  <div>{team.won}</div>

                  <div>{team.draw}</div>

                  <div>{team.lost}</div>

                  <div>{team.goalsFor}</div>

                  <div>{team.goalsAgainst}</div>

                  <div>
                    {team.goalDifference > 0
                      ? `+${team.goalDifference}`
                      : team.goalDifference}
                  </div>

                  <div className="points">
                    {team.points}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}

            <div className="table-legend">
              <span>
                <i className="legend champions"></i>
                Champions League
              </span>

              <span>
                <i className="legend europa"></i>
                Europa League
              </span>

              <span>
                <i className="legend relegation-zone"></i>
                Relegation
              </span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Competitions;