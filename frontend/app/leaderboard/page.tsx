"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, Event } from "@/services/event.service";
import { Trophy, MapPin, CalendarRange, Loader2 } from "lucide-react";

export default function LeaderboardIndex() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 sm:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 ring-1 ring-yellow-500/40">
            <Trophy className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-gray-400 text-sm">
              Select an event to view its rankings.
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-800 my-6" />

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        )}

        {!loading && events.length === 0 && !error && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center text-gray-500">
            No events available yet.
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/leaderboard/${event.id}`}
                className="group block bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {event.title}
                  </h2>
                  <Trophy className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                </div>

                {event.location && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1.5">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.startDate && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                    <CalendarRange className="h-3 w-3" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {event.tracks?.slice(0, 3).map((track) => (
                    <span
                      key={track}
                      className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400"
                    >
                      {track}
                    </span>
                  ))}
                  {event.tracks?.length > 3 && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      +{event.tracks.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
                  <span>View leaderboard</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
