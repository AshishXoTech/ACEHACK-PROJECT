"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { judgeService, AssignedTeam, RepoAnalysisResponse } from "@/services/judge.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { useAuth } from "@/context/AuthContext";

type Section = "assigned" | "evaluate" | "ai" | "leaderboard";
const SECTION_HASH: Record<Section, string> = {
  assigned: "#assigned-teams",
  ai: "#ai-analysis",
  evaluate: "#evaluate-teams",
  leaderboard: "#leaderboard",
};

const HASH_SECTION: Record<string, Section> = {
  "#assigned-teams": "assigned",
  "#ai-analysis": "ai",
  "#evaluate-teams": "evaluate",
  "#leaderboard": "leaderboard",
};

export default function JudgeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("assigned");
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [leaderboard, setLeaderboard] = useState<
    { rank: number; teamName: string; totalScore: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAiTeamId, setSelectedAiTeamId] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiAnalysisByTeam, setAiAnalysisByTeam] = useState<Record<string, RepoAnalysisResponse>>({});

  const setSection = (section: Section) => {
    setActiveSection(section);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${SECTION_HASH[section]}`);
    }
  };

  const loadDashboard = async () => {
    const [assignedTeams, leaderboardRows] = await Promise.all([
      judgeService.getAssignedTeams(),
      judgeService.getLeaderboard(),
    ]);

    setTeams(assignedTeams.teams || []);
    if (assignedTeams.teams?.length) {
      setSelectedAiTeamId((prev) => prev || assignedTeams.teams[0].teamId);
    }
    setLeaderboard(leaderboardRows || []);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromHash = () => {
      const section = HASH_SECTION[window.location.hash];
      if (section) setActiveSection(section);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "judge") return;

    loadDashboard()
      .catch(() => setError("Could not load assigned teams."))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  useEffect(() => {
    if (!user || user.role !== "judge") return;
    if (activeSection !== "leaderboard") return;

    judgeService
      .getLeaderboard()
      .then((rows) => setLeaderboard(rows || []))
      .catch(() => undefined);
  }, [activeSection, user]);

  useEffect(() => {
    if (!user || user.role !== "judge") return;
    if (activeSection !== "ai") return;
    if (!selectedAiTeamId) return;
    if (aiAnalysisByTeam[selectedAiTeamId]) return;
    const selectedTeam = teams.find((team) => team.teamId === selectedAiTeamId);
    if (!selectedTeam?.submissionId) {
      setAiError("Repository analysis unavailable: submission not found.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    judgeService
      .getRepoAnalysis(selectedAiTeamId)
      .then((analysis) => {
        setAiAnalysisByTeam((prev) => ({ ...prev, [selectedAiTeamId]: analysis }));
      })
      .catch((err) => {
        setAiError(err?.response?.data?.message || "Repository analysis unavailable");
      })
      .finally(() => setAiLoading(false));
  }, [activeSection, selectedAiTeamId, aiAnalysisByTeam, user, teams]);

  const pending = useMemo(
    () => teams.filter((team) => !team.evaluated && Boolean(team.submissionId)),
    [teams]
  );
  const withSubmission = useMemo(() => teams.filter((team) => team.submissionId), [teams]);

  if (loading) {
    return (
      <RoleGuard allowedRoles={["judge"]}>
        <DashboardShell>
          <PageSkeleton rows={6} />
        </DashboardShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["judge"]}>
      <DashboardShell>
        <div className="max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-slate-50">Judge Dashboard</h1>
            <p className="text-slate-400 text-sm">
              {teams.length} team{teams.length !== 1 ? "s" : ""} assigned to you
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Assigned", value: teams.length, color: "text-blue-400" },
              { label: "Pending", value: pending.length, color: "text-yellow-400" },
              { label: "Ready to Evaluate", value: withSubmission.length, color: "text-cyan-400" },
            ].map((item) => (
              <div key={item.label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
                <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-gray-400 text-sm mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="px-2 pb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                Sections
              </p>
              <nav className="space-y-1 text-sm">
                <button type="button" onClick={() => setSection("assigned")} className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${activeSection === "assigned" ? "bg-slate-800 text-cyan-200" : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-200"}`}>Assigned Teams</button>
                <button type="button" onClick={() => setSection("ai")} className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${activeSection === "ai" ? "bg-slate-800 text-cyan-200" : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-200"}`}>AI Analysis</button>
                <button type="button" onClick={() => setSection("evaluate")} className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${activeSection === "evaluate" ? "bg-slate-800 text-cyan-200" : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-200"}`}>Evaluate Teams</button>
                <button type="button" onClick={() => setSection("leaderboard")} className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${activeSection === "leaderboard" ? "bg-slate-800 text-cyan-200" : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-200"}`}>Leaderboard</button>
              </nav>
            </aside>

            <div>
              {activeSection === "assigned" && (
                <section className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="border-b border-slate-700 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-100">Assigned Teams</h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-gray-400 text-left">
                        <th className="px-4 py-3 font-medium">Team</th>
                        <th className="px-4 py-3 font-medium">Project</th>
                        <th className="px-4 py-3 font-medium">Repo Link</th>
                        <th className="px-4 py-3 font-medium">Demo</th>
                        <th className="px-4 py-3 font-medium">Summary</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                            No teams assigned yet.
                          </td>
                        </tr>
                      ) : (
                        teams.map((team) => (
                          <tr key={team.teamId} className="border-b border-slate-800 last:border-0">
                            <td className="px-4 py-3 font-medium text-slate-100">{team.teamName}</td>
                            <td className="px-4 py-3 text-slate-300">{team.projectName || team.teamName}</td>
                            <td className="px-4 py-3">
                              {team.repoUrl || team.repo ? (
                                <a href={team.repoUrl || team.repo || "#"} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                                  Repository
                                </a>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {team.demoVideo || team.demoUrl ? (
                                <a href={team.demoVideo || team.demoUrl || "#"} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                                  Demo
                                </a>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-300 max-w-[320px] truncate">
                              {team.description || team.readmeSummary || team.readme || team.summary || "No summary available."}
                            </td>
                            <td className="px-4 py-3 text-cyan-300 font-semibold">
                              {team.score ?? "-"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {team.submissionId ? (
                                  <>
                                    <Link href={`/dashboard/judge/submission/${team.teamId}`} className="rounded bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs text-slate-100">
                                      View Submission
                                    </Link>
                                    <Link href={`/dashboard/judge/evaluate/${team.teamId}`} className="rounded bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs text-white">
                                      Evaluate
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAiTeamId(team.teamId);
                                        setSection("ai");
                                      }}
                                      className="rounded bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs text-slate-100"
                                    >
                                      AI Analysis
                                    </button>
                                  </>
                                ) : (
                                  <span className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-500">
                                    No submission yet
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {activeSection === "ai" && (
                <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <h2 className="text-sm font-semibold text-slate-100 mb-3">AI Analysis</h2>
                  {teams.length === 0 ? (
                    <p className="text-sm text-slate-500">No AI summaries available.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-w-xs">
                        <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-500">
                          Select Team
                        </label>
                        <select
                          value={selectedAiTeamId}
                          onChange={(event) => setSelectedAiTeamId(event.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                          {teams.map((team) => (
                            <option key={`team-opt-${team.teamId}`} value={team.teamId}>
                              {team.teamName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {aiLoading ? (
                        <p className="text-sm text-slate-400">Running repository analysis...</p>
                      ) : aiError ? (
                        <p className="text-sm text-rose-300">{aiError}</p>
                      ) : aiAnalysisByTeam[selectedAiTeamId] ? (
                        <div className="space-y-3 text-sm">
                          <div className="rounded border border-slate-800 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Project Overview</p>
                            <p className="mt-2 text-slate-200">{aiAnalysisByTeam[selectedAiTeamId].projectSummary}</p>
                            <p className="mt-2 text-slate-400">
                              <span className="text-slate-500">Category:</span>{" "}
                              {aiAnalysisByTeam[selectedAiTeamId].projectCategory}
                            </p>
                          </div>

                          <div className="rounded border border-slate-800 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Tech Stack</p>
                            <p className="mt-2 text-slate-200">
                              {aiAnalysisByTeam[selectedAiTeamId].techStack.length
                                ? aiAnalysisByTeam[selectedAiTeamId].techStack.join(", ")
                                : "Not detected"}
                            </p>
                          </div>

                          <div className="rounded border border-slate-800 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Repository Activity</p>
                            <p className="mt-2 text-slate-200">
                              Total commits: {aiAnalysisByTeam[selectedAiTeamId].commitInsights.totalCommits}
                            </p>
                            <p className="text-slate-400">
                              Top contributor: {aiAnalysisByTeam[selectedAiTeamId].commitInsights.topContributor}
                            </p>
                            <p className="text-slate-400">
                              Pattern: {aiAnalysisByTeam[selectedAiTeamId].commitInsights.developmentPattern}
                            </p>
                            <p className="text-slate-400">
                              Commit frequency: 7d {aiAnalysisByTeam[selectedAiTeamId].commitFrequency?.last7Days ?? 0}, 30d {aiAnalysisByTeam[selectedAiTeamId].commitFrequency?.last30Days ?? 0}
                            </p>
                            <p className="text-slate-400">
                              Focus: {aiAnalysisByTeam[selectedAiTeamId].commitInsights.majorFocus}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No analysis available.</p>
                      )}
                    </div>
                  )}
                </section>
              )}

              {activeSection === "evaluate" && (
                <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <h2 className="text-sm font-semibold text-slate-100 mb-3">Evaluate Teams</h2>
                  {pending.length === 0 ? (
                    <p className="text-sm text-slate-500">All assigned submissions are evaluated.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {pending.map((team) => (
                        <Link
                          key={`eval-${team.teamId}`}
                          href={`/dashboard/judge/evaluate/${team.teamId}`}
                          className="rounded border border-cyan-500/60 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/20"
                        >
                          Evaluate {team.teamName}
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeSection === "leaderboard" && (
                <section className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="border-b border-slate-700 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-100">Leaderboard</h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-gray-400 text-left">
                        <th className="px-4 py-3 font-medium">Rank</th>
                        <th className="px-4 py-3 font-medium">Team</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                            No leaderboard data available.
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((entry) => (
                          <tr key={`${entry.rank}-${entry.teamName}`} className="border-b border-slate-800 last:border-0">
                            <td className="px-4 py-3 text-cyan-300">#{entry.rank}</td>
                            <td className="px-4 py-3 text-slate-100">{entry.teamName}</td>
                            <td className="px-4 py-3 text-slate-200">{entry.totalScore}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </section>
              )}
            </div>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
