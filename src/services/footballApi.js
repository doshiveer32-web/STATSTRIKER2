const apiRequest = async (endpoint) => {
  const url = `/api/football-data/${endpoint}`;

  console.log("API REQUEST:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error("API ERROR:", response.status, data);

    throw new Error(`API Error: ${response.status}`);
  }

  return data;
};

export const getCompetitions = () =>
  apiRequest("competitions");

export const getCompetitionStandings = (
  competitionCode,
  season
) =>
  apiRequest(
    `competitions/${competitionCode}/standings?season=${season}`
  );

export const getCompetitionMatches = (
  competitionCode,
  season
) =>
  apiRequest(
    `competitions/${competitionCode}/matches?season=${season}`
  );

export const getCompetitionScorers = (
  competitionCode,
  season
) =>
  apiRequest(
    `competitions/${competitionCode}/scorers?season=${season}`
  );

export const getTeam = (teamId) =>
  apiRequest(`teams/${teamId}`);

export const getTeamMatches = (teamId) =>
  apiRequest(`teams/${teamId}/matches`);