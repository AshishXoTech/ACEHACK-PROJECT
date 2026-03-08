"use client";
import { useEffect, useState, useTransition } from "react";
import { judgeService, JudgeAssignment, Judge } from "@/services/judge.service";
import { getEvents, Event } from "@/services/event.service";
import { RowSkeleton } from "@/components/ui/LoadingSkeleton";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { Users, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function JudgeAssignmentPage() {
  const { user, loading: authLoading } = useAuth();
  const isOrganizer = user?.role === "organizer";
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [, startTransition] = useTransition();

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Load events on mount
  useEffect(() => {
    if (authLoading || !isOrganizer) return;
    getEvents()
      .then((list) => {
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
      })
      .catch(() => notify("Failed to load events.", false))
      .finally(() => setEventsLoading(false));
  }, [authLoading, isOrganizer]);

  // Load assignments whenever selected event changes
  useEffect(() => {
    if (authLoading || !isOrganizer) return;
    if (!selectedEventId) return;
    setLoading(true);
    judgeService
      .getAssignments(selectedEventId)
      .then((data) => {
        setAssignments(data.assignments || []);
        setJudges(data.judges || []);
      })
      .catch(() => notify("Failed to load assignments.", false))
      .finally(() => setLoading(false));
  }, [selectedEventId, authLoading, isOrganizer]);

  const assign = async (teamId: string, judgeId: string) => {
    setSaving(teamId);
    try {
      await judgeService.assignJudge(selectedEventId, teamId, judgeId);
      startTransition(() => {
        setAssignments((prev) =>
          prev.map((a) =>
            a.teamId === teamId
              ? {
                ...a,
                judgeId,
                judgeName: judges.find((j) => j.id === judgeId)?.name ?? null,
              }
              : a
          )
        );
      });
      notify("Judge assigned successfully.");
    } catch {
      notify("Failed to assign judge.", false);
    } finally {
      setSaving(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["organizer"]}>
      <DashboardShell>
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.ok
                ? "bg-emerald-700/90 text-emerald-100"
                : "bg-rose-700/90 text-rose-100"
              }`}
          >
            {toast.msg}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                Judge Assignment
              </h2>
              <p className="text-xs text-slate-400">
                Assign judges to teams for the selected event.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {eventsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <select
                  className="select w-52"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">Select event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-800/80 px-4 py-3">
              <Users className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-medium text-slate-100">
                Team — Judge assignments
              </p>
            </div>

            <div className="table-wrapper overflow-x-auto">
              <table className="table min-w-full">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Current Judge</th>
                    <th>Assign Judge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <RowSkeleton key={i} cols={4} />
                    ))
                  ) : !selectedEventId ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-slate-400"
                      >
                        Please select an event above.
                      </td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-slate-400"
                      >
                        No teams found for this event.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((a) => (
                      <AssignRow
                        key={a.teamId}
                        assignment={a}
                        judges={judges}
                        saving={saving === a.teamId}
                        onAssign={(judgeId) => assign(a.teamId, judgeId)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}

function AssignRow({
  assignment,
  judges,
  saving,
  onAssign,
}: {
  assignment: JudgeAssignment;
  judges: Judge[];
  saving: boolean;
  onAssign: (judgeId: string) => void;
}) {
  const [selected, setSelected] = useState(assignment.judgeId ?? "");
  useEffect(() => {
    setSelected(assignment.judgeId ?? "");
  }, [assignment.judgeId]);

  return (
    <tr>
      <td className="font-medium text-slate-100">{assignment.teamName}</td>
      <td className="text-slate-400">
        {assignment.judgeName ?? (
          <span className="italic text-slate-600">Unassigned</span>
        )}
      </td>
      <td>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="select"
        >
          <option value="">— Select judge —</option>
          {judges.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button
          onClick={() => selected && onAssign(selected)}
          disabled={saving || !selected}
          className="btn-primary px-3 py-1 text-xs disabled:opacity-40"
        >
          {saving ? "Saving…" : "Assign"}
        </button>
      </td>
    </tr>
  );
}
