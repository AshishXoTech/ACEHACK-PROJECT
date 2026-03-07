"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { judgeService, AssignedTeam } from "@/services/judge.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function JudgeDashboard() {
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    judgeService.getAssignedTeams()
      .then(d => setTeams(d.teams || []))
      .catch(() => setError("Could not load assigned teams."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton rows={5} />;

  const pending = teams.filter(t => !t.evaluated);
  const completed = teams.filter(t => t.evaluated);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">
        <h1 className="text-2xl font-bold mb-2">Judge Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">
          {teams.length} team{teams.length !== 1 ? "s" : ""} assigned to you
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Assigned", value: teams.length, color: "text-blue-400" },
            { label: "Pending", value: pending.length, color: "text-yellow-400" },
            { label: "Evaluated", value: completed.length, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <TeamSection title="Pending Evaluations" teams={pending} />

        {completed.length > 0 && (
          <TeamSection title="Completed" teams={completed} done className="mt-8" />
        )}
      </div>
    </div>
  );
}

function TeamSection({ title, teams, done = false, className = "" }: {
  title: string; teams: AssignedTeam[]; done?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="bg-slate-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{teams.length}</span>
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">None yet.</p>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Repo</th>
                <th className="px-4 py-3 font-medium">Demo</th>
                {done && <th className="px-4 py-3 font-medium">Score</th>}
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.teamId} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{t.teamName}</td>
                  <td className="px-4 py-3 text-gray-400">{t.eventName}</td>
                  <td className="px-4 py-3">
                    {t.repoUrl
                      ? <a href={t.repoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Repo ↗</a>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {t.demoUrl
                      ? <a href={t.demoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Demo ↗</a>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  {done && (
                    <td className="px-4 py-3 font-semibold text-green-400">{t.score ?? "—"}</td>
                  )}
                  <td className="px-4 py-3">
                    {t.submissionId ? (
                      <Link
                        href={`/dashboard/judge/evaluate/${t.submissionId}`}
                        className={`px-3 py-1 rounded text-sm transition-colors ${done
                            ? "bg-slate-700 hover:bg-slate-600 text-gray-300"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                      >
                        {done ? "Re-evaluate" : "Evaluate"}
                      </Link>
                    ) : (
                      <span className="text-gray-600 text-xs">No submission</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
