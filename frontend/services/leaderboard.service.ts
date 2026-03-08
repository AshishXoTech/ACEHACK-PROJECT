import api from "./api";

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
}

export interface LeaderboardData {
  published: boolean;
  entries: LeaderboardEntry[];
}

export const leaderboardService = {
  get: (eventId: string) =>
    api
      .get<{
        published: boolean;
        entries: {
          rank: number;
          teamId: string;
          teamName: string;
          projectName: string;
          score: number;
        }[];
      }>(`/leaderboard/${eventId}`)
      .then((r) => ({
        published: r.data.published,
        entries: (r.data.entries || []).map((entry, index) => ({
          rank: entry.rank ?? index + 1,
          teamId: entry.teamId,
          teamName: entry.teamName,
          score: entry.score,
        })),
      })),

  publish: (eventId: string) =>
    api.post(`/events/${eventId}/leaderboard/publish`).then(r => r.data),
};
