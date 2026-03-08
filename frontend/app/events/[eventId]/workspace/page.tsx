"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EventWorkspaceLayout } from "@/components/workspace/EventWorkspaceLayout";
import { RoleGuard } from "@/middleware/RoleGuard";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { Event, getEventById } from "@/services/event.service";
import { getParticipantDashboardData } from "@/services/participant.service";

export default function EventWorkspaceOverviewPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [teamStatus, setTeamStatus] = useState("Not registered");
  const [submissionStatus, setSubmissionStatus] = useState("Not submitted");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getEventById(eventId), getParticipantDashboardData()])
      .then(([eventData, participant]) => {
        setEvent(eventData);
        const registration = participant.registrations.find((r) => r.eventId === eventId);
        setTeamStatus(registration?.status ?? "Not registered");
        setSubmissionStatus(registration?.submissionId ? "Submitted" : "Pending");
      })
      .catch(() => setError("Could not load event workspace data."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const tracks = useMemo(() => event?.tracks ?? [], [event?.tracks]);

  if (loading) {
    return (
      <RoleGuard allowedRoles={["participant"]}>
        <DashboardShell>
          <PageSkeleton rows={5} />
        </DashboardShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["participant"]}>
      <DashboardShell>
        <EventWorkspaceLayout
          eventId={eventId}
          title={event?.title ?? "Event Workspace"}
          subtitle="Overview"
        >
          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="h-40 bg-gradient-to-r from-cyan-900/30 to-slate-900" />
            <div className="space-y-4 p-5">
              <p className="text-sm text-slate-300">{event?.description || "No description available."}</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Tracks</p>
                  <p className="mt-2 text-sm text-slate-200">
                    {tracks.length ? tracks.join(", ") : "No tracks provided"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Prize Pool</p>
                  <p className="mt-2 text-sm text-slate-200">TBA</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Registration Deadline
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {event?.endDate ? new Date(event.endDate).toLocaleString() : "TBA"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Team Status</p>
                  <p className="mt-2 text-sm capitalize text-slate-200">{teamStatus}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Submission Status</p>
                  <p className="mt-2 text-sm text-slate-200">{submissionStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </EventWorkspaceLayout>
      </DashboardShell>
    </RoleGuard>
  );
}

