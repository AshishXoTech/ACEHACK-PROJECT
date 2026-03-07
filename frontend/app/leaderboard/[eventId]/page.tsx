"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { leaderboardService, LeaderboardEntry } from "@/services/leaderboard.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const IS_DEV = process.env.NODE_ENV === "development";

// DUMMY DATA (DEV ONLY): fallback leaderboard for judge/participant flow testing.
const DUMMY_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, teamId: "1", teamName: "Code Ninjas", score: 32 },
  { rank: 2, teamId: "2", teamName: "Dev Wizards", score: 29 },
];

export default function LeaderboardPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState<Set<number>>(new Set());

  useEffect(() => {
    leaderboardService
      .get(eventId)
      .then((d) => {
        const loadedEntries = d.entries || [];
        if (loadedEntries.length === 0 && IS_DEV) {
          setPublished(false);
          setEntries(DUMMY_LEADERBOARD_ENTRIES);
          DUMMY_LEADERBOARD_ENTRIES.forEach((_, i) => {
            setTimeout(
              () => setVisible((p) => {
                const n = new Set(p);
                n.add(i);
                return n;
              }),
              i * 70,
            );
          });
          return;
        }

        setEntries(loadedEntries);
        setPublished(d.published);
        loadedEntries.forEach((_, i) => {
          setTimeout(
            () => setVisible((p) => {
              const n = new Set(p);
              n.add(i);
              return n;
            }),
            i * 70,
          );
        });
      })
      .catch(() => setError("Could not load leaderboard."))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <PageSkeleton rows={8} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              {published ? "Results published" : "Results not yet published"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {entries.length === 0 && !error ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center text-gray-500">
            {published ? "No results available yet." : "Leaderboard not published yet."}
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium w-20">Rank</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr
                    key={e.teamId}
                    style={{ transitionDelay: `${i * 40}ms` }}
                    className={`border-b border-slate-800 last:border-0 transition-all duration-500 ${
                      visible.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    } ${e.rank <= 3 ? "bg-slate-800/30" : "hover:bg-slate-800/20"}`}
                  >
                    <td className="px-4 py-3 text-lg font-bold">
                      {MEDALS[e.rank] ?? <span className="text-gray-500 text-sm font-mono">#{e.rank}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{e.teamName}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span
                        className={
                          e.rank === 1
                            ? "text-yellow-400 text-lg"
                            : e.rank === 2
                              ? "text-gray-300"
                              : e.rank === 3
                                ? "text-amber-600"
                                : "text-blue-400"
                        }
                      >
                        {e.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
