"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { RoleGuard } from "@/middleware/RoleGuard";
import { AssignedTeam, judgeService } from "@/services/judge.service";

type JudgeSection = "assigned" | "evaluate" | "ai" | "leaderboard";
const IS_DEV = process.env.NODE_ENV === "development";

// DUMMY DATA (DEV ONLY): remove when real judge assignment data is available.
const DUMMY_ASSIGNED_TEAMS: AssignedTeam[] = [
  {
    teamId: "1",
    teamName: "Code Ninjas",
    eventId: "1",
    eventName: "AI Innovation Hackathon",
    repoUrl: "https://github.com/demo/ai-healthcare",
    readmeSummary: "AI system that predicts disease risk using patient data.",
    members: ["Alice", "Bob", "Charlie"],
    submissionId: "1",
    score: null,
    evaluated: false,
  },
  {
    teamId: "2",
    teamName: "Dev Wizards",
    eventId: "1",
    eventName: "AI Innovation Hackathon",
    repoUrl: "https://github.com/demo/smart-agriculture",
    readmeSummary: "Smart agriculture platform using IoT sensors and AI predictions.",
    members: ["Rahul", "Priya", "Ankit"],
    submissionId: "2",
    score: null,
    evaluated: false,
  },
];

export default function JudgeDashboardPage() {
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<JudgeSection>("assigned");

  useEffect(() => {
    judgeService
      .getAssignedTeams()
      .then((data) => {
        const loadedTeams = data.teams || [];
        if (loadedTeams.length === 0 && IS_DEV) {
          setTeams(DUMMY_ASSIGNED_TEAMS);
          return;
        }
        setTeams(loadedTeams);
      })
      .catch(() => {
        if (IS_DEV) {
          setTeams(DUMMY_ASSIGNED_TEAMS);
          return;
        }
        setError("Could not load assigned teams.");
      })
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => {
    const uniq = new Map<string, { eventId: string; eventName: string }>();
    teams.forEach((team) => {
      if (!uniq.has(team.eventId)) {
        uniq.set(team.eventId, { eventId: team.eventId, eventName: team.eventName });
      }
    });
    return Array.from(uniq.values());
  }, [teams]);

  const evaluatedTeams = useMemo(() => teams.filter((team) => team.evaluated), [teams]);
  const unevaluatedTeams = useMemo(() => teams.filter((team) => !team.evaluated), [teams]);

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
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="px-2 pb-2 text-xs uppercase tracking-[0.16em] text-slate-500">Judge Panel</p>
            <nav className="space-y-1 text-sm">
              <SidebarButton
                label="Assigned Teams"
                active={activeSection === "assigned"}
                onClick={() => setActiveSection("assigned")}
              />
              <SidebarButton
                label="Evaluate Teams"
                active={activeSection === "evaluate"}
                onClick={() => setActiveSection("evaluate")}
              />
              <SidebarButton
                label="AI Analysis"
                active={activeSection === "ai"}
                onClick={() => setActiveSection("ai")}
              />
              <SidebarButton
                label="Leaderboard"
                active={activeSection === "leaderboard"}
                onClick={() => setActiveSection("leaderboard")}
              />
            </nav>
          </aside>

          <section className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-slate-50">Judge Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">
                Review assigned teams, inspect submissions, run AI insights, and submit scores.
              </p>
            </header>

            {error && (
              <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {activeSection === "assigned" && <AssignedTeamsPanel teams={teams} />}

            {activeSection === "evaluate" && (
              <SimpleListPanel
                title="Evaluate Teams"
                emptyText="No assigned teams available for evaluation."
                teams={unevaluatedTeams}
                actionLabel="Open Evaluation"
                actionHref={(teamId) => `/dashboard/judge/evaluate/${teamId}`}
              />
            )}

            {activeSection === "ai" && (
              <SimpleListPanel
                title="AI Analysis"
                emptyText="No assigned teams available for AI analysis."
                teams={teams}
                actionLabel="Open Submission"
                actionHref={(teamId) => `/dashboard/judge/submission/${teamId}`}
              />
            )}

            {activeSection === "leaderboard" && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                  Leaderboard Access
                </h2>
                {events.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">No event leaderboard available yet.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {events.map((event) => (
                      <Link
                        key={event.eventId}
                        href={`/leaderboard/${event.eventId}`}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        {event.eventName}
                      </Link>
                    ))}
                  </div>
                )}

                {evaluatedTeams.length > 0 && (
                  <p className="mt-4 text-xs text-slate-500">
                    You have evaluated {evaluatedTeams.length} team{evaluatedTeams.length !== 1 ? "s" : ""}.
                  </p>
                )}
              </section>
            )}
          </section>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}

function SidebarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left ${
        active
          ? "bg-slate-800 text-cyan-300 ring-1 ring-cyan-500/40"
          : "text-slate-300 hover:bg-slate-800/70"
      }`}
    >
      {label}
    </button>
  );
}

function AssignedTeamsPanel({ teams }: { teams: AssignedTeam[] }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
          Assigned Teams
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="px-5 py-3 font-medium">Team</th>
              <th className="px-5 py-3 font-medium">Repo Link</th>
              <th className="px-5 py-3 font-medium">Summary</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-slate-500" colSpan={5}>
                  No assigned teams yet.
                </td>
              </tr>
            )}
            {teams.map((team) => (
              <tr key={team.teamId} className="border-b border-slate-800/80 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-100">{team.teamName}</p>
                  <p className="text-xs text-slate-500">{team.eventName}</p>
                </td>
                <td className="px-5 py-4">
                  {team.repoUrl ? (
                    <a
                      href={team.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:underline"
                    >
                      Open Repo
                    </a>
                  ) : (
                    <span className="text-slate-500">N/A</span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-300">
                  {team.readmeSummary ? team.readmeSummary.slice(0, 80) : "No summary provided"}
                </td>
                <td className="px-5 py-4 text-slate-200">{team.score ?? "-"}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/judge/submission/${team.teamId}`}
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                    >
                      View Submission
                    </Link>
                    <Link
                      href={`/dashboard/judge/evaluate/${team.teamId}`}
                      className="rounded-md border border-cyan-500/60 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/20"
                    >
                      Evaluate
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SimpleListPanel({
  title,
  emptyText,
  teams,
  actionLabel,
  actionHref,
}: {
  title: string;
  emptyText: string;
  teams: AssignedTeam[];
  actionLabel: string;
  actionHref: (teamId: string) => string;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">{title}</h2>
      {teams.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {teams.map((team) => (
            <div
              key={`${title}-${team.teamId}`}
              className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{team.teamName}</p>
                <p className="text-xs text-slate-500">{team.eventName}</p>
              </div>
              <Link
                href={actionHref(team.teamId)}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
              >
                {actionLabel}
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
