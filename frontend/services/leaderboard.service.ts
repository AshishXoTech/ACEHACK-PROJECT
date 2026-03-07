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
    api.get<{ published?: boolean; isPublished?: boolean; entries: LeaderboardEntry[] }>(
      `/events/${eventId}/leaderboard`,
    ).then((r) => ({
      published: r.data.published ?? r.data.isPublished ?? false,
      entries: r.data.entries,
    })),

  publish: (eventId: string) =>
    api.post(`/events/${eventId}/leaderboard/publish`).then(r => r.data),
};
