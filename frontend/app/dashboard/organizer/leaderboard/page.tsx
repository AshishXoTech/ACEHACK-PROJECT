"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, Event } from "@/services/event.service";
import { leaderboardService } from "@/services/leaderboard.service";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { Trophy, Loader2, ExternalLink } from "lucide-react";

export default function OrganizerLeaderboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [pubLoading, setPubLoading] = useState(false);

  const [pubResult, setPubResult] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then((list) => {
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
      })
      .catch(() => setError("Failed to load events."))
      .finally(() => setEventsLoading(false));
  }, []);

  const publish = async () => {
    if (!selectedEventId) return;
    setPubLoading(true); setError(null); setPubResult(null);
    try {
      await leaderboardService.publish(selectedEventId);
      setPubResult("Leaderboard published successfully!");
    } catch {
      setError("Failed to publish leaderboard.");
    } finally {
      setPubLoading(false);
    }
  };


  return (
    <RoleGuard allowedRoles={["organizer"]}>
      <DashboardShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                Publish &amp; Certificates
              </h2>
              <p className="text-xs text-slate-400">
                Finalise and publish leaderboards for the public.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {eventsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <select
                  className="select w-52"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setPubResult(null);

                    setError(null);
                  }}
                >
                  <option value="">Select event</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          <div className="grid gap-4 max-w-md">
            {/* Publish leaderboard */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-medium text-slate-100">
                  Publish Leaderboard
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Make the leaderboard visible to all participants and the public.
              </p>
              <button
                onClick={publish}
                disabled={pubLoading || !selectedEventId}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {pubLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  "Publish Leaderboard"
                )}
              </button>
              {pubResult && (
                <p className="text-emerald-400 text-xs">✅ {pubResult}</p>
              )}
              {selectedEventId && (
                <Link
                  href={`/leaderboard/${selectedEventId}`}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View public leaderboard
                </Link>
              )}
            </div>


          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
