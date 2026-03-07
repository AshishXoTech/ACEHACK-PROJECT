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
    api.get<LeaderboardData>(`/events/${eventId}/leaderboard`).then(r => r.data),

  publish: (eventId: string) =>
    api.post(`/events/${eventId}/leaderboard/publish`).then(r => r.data),
};
