const apiRequest = async (endpoint) => {
  const response = await fetch(`/api/football-data/${endpoint}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export const getCompetitions = () => {
  return apiRequest("competitions");
};

export const getCompetitionStandings = (
  competitionCode,
  season
) => {
  return apiRequest(
    `competitions/${competitionCode}/standings?season=${season}`
  );
};

export const getCompetitionMatches = (
  competitionCode,
  season
) => {
  return apiRequest(
    `competitions/${competitionCode}/matches?season=${season}`
  );
};

export const getCompetitionScorers = (
  competitionCode,
  season
) => {
  return apiRequest(
    `competitions/${competitionCode}/scorers?season=${season}`
  );
};

export const getTeam = (teamId) => {
  return apiRequest(`teams/${teamId}`);
};

export const getTeamMatches = (teamId) => {
  return apiRequest(`teams/${teamId}/matches`);
};