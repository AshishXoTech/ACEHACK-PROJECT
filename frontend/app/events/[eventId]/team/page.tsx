"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EventWorkspaceLayout } from "@/components/workspace/EventWorkspaceLayout";
import { RoleGuard } from "@/middleware/RoleGuard";
import { ToastMessage } from "@/components/ui/ToastMessage";
import {
  createWorkspaceTeam,
  EventTeam,
  getTeamByEvent,
  leaveTeam,
} from "@/services/participant-workspace.service";

export default function TeamManagementPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [team, setTeam] = useState<EventTeam | null>(null);
  const [teamName, setTeamName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTeamByEvent(eventId);
      setTeam(data);
    } catch {
      setToast({ ok: false, msg: "Could not load team details." });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleCreateTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setToast({ ok: false, msg: "Team name is required." });
      return;
    }

    setSubmitting(true);
    try {
      const members = memberEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      await createWorkspaceTeam({
        eventId,
        name: teamName.trim(),
        members,
      });
      setToast({ ok: true, msg: "Team created successfully." });
      setTeamName("");
      setMemberEmails("");
      await loadTeam();
    } catch {
      setToast({ ok: false, msg: "Failed to create team." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveTeam = async () => {
    setSubmitting(true);
    try {
      await leaveTeam(eventId);
      setTeam(null);
      setToast({ ok: true, msg: "You left the team." });
    } catch {
      setToast({ ok: false, msg: "Could not leave team." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["participant"]}>
      <DashboardShell>
        <ToastMessage toast={toast} onClose={() => setToast(null)} />
        <EventWorkspaceLayout
          eventId={eventId}
          title="Team Management"
          subtitle="Create a team, invite members, and manage participation"
        >
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
              Loading team details...
            </div>
          ) : team ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Team Name</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{team.name}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Team Leader</p>
                <p className="mt-2 text-sm text-slate-200">
                  {team.leader ? `${team.leader.name} (${team.leader.email})` : "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Members</p>
                {team.members.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No members listed.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {team.members.map((member) => (
                      <li key={member.id} className="rounded-lg border border-slate-800 px-3 py-2">
                        {member.name} ({member.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={handleLeaveTeam}
                disabled={submitting}
                className="rounded-lg border border-rose-500/70 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"
              >
                Leave Team
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCreateTeam}
              className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="teamName">
                  Team Name
                </label>
                <input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                  placeholder="Enter team name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="memberEmails">
                  Member Emails
                </label>
                <textarea
                  id="memberEmails"
                  value={memberEmails}
                  onChange={(e) => setMemberEmails(e.target.value)}
                  className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Team"}
              </button>
            </form>
          )}
        </EventWorkspaceLayout>
      </DashboardShell>
    </RoleGuard>
  );
}

