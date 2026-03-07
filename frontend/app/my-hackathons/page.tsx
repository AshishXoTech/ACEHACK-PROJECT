"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  getMyHackathons,
  MyHackathonEvent,
} from "@/services/participant-workspace.service";

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-900/40 border-green-700 text-green-300",
  pending: "bg-yellow-900/40 border-yellow-700 text-yellow-300",
  rejected: "bg-red-900/40 border-red-700 text-red-300",
};

export default function MyHackathonsPage() {
  const [events, setEvents] = useState<MyHackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyHackathons()
      .then((items) => setEvents(items))
      .catch(() => setError("Could not load your hackathons."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <RoleGuard allowedRoles={["participant"]}>
        <DashboardShell>
          <PageSkeleton rows={4} />
        </DashboardShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["participant"]}>
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">My Hackathons</h1>
            <p className="mt-1 text-sm text-slate-400">
              Open a registered event workspace and continue your submission workflow.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {events.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
              <p className="text-slate-200">You have not joined any hackathons yet</p>
              <Link
                href="/events"
                className="mt-4 inline-flex rounded-lg border border-cyan-500/60 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event, index) => (
                <div
                  key={`${event.eventId}-${event.teamName}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40"
                >
                  <div className="h-28 w-full bg-gradient-to-r from-slate-800 to-slate-900">
                    {event.banner ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.banner}
                        alt={event.eventName}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="space-y-3 p-4">
                    <h2 className="text-lg font-semibold text-slate-100">{event.eventName}</h2>
                    <p className="text-sm text-slate-400">Team: {event.teamName}</p>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${
                        STATUS_STYLE[event.status] ?? STATUS_STYLE.pending
                      }`}
                    >
                      {event.status}
                    </span>
                    <div>
                      <Link
                        href={`/events/${event.eventId}/workspace`}
                        className="inline-flex rounded-lg border border-cyan-500/60 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
                      >
                        Open Workspace
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
