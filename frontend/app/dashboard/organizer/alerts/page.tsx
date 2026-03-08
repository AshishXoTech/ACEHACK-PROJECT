"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { getEvents } from "@/services/event.service";
import { alertService } from "@/services/alert.service";

interface EventOption {
  id: string;
  name: string;
}

export default function OrganizerAlertsPage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isInstant, setIsInstant] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents()
      .then((rows) => {
        const mapped = (rows || []).map((row) => ({ id: row.id, name: row.title }));
        setEvents(mapped);
        if (mapped.length) setEventId(mapped[0].id);
      })
      .catch(() => setError("Could not load events"));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    if (!eventId || !title.trim() || !message.trim()) {
      setError("Event, title and message are required.");
      return;
    }
    if (!isInstant && !scheduledAt) {
      setError("Scheduled time is required for scheduled alerts.");
      return;
    }

    setLoading(true);
    try {
      await alertService.create({
        eventId,
        title: title.trim(),
        message: message.trim(),
        isInstant,
        scheduledAt: isInstant ? undefined : new Date(scheduledAt).toISOString(),
      });
      setFeedback(isInstant ? "Instant alert sent." : "Scheduled alert created.");
      setTitle("");
      setMessage("");
      setScheduledAt("");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
          : "Could not create alert.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["organizer"]}>
      <DashboardShell>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-2xl font-bold text-slate-50">Organizer Alerts</h1>
          {error && (
            <div className="rounded border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          {feedback && (
            <div className="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {feedback}
            </div>
          )}

          <form
            onSubmit={submit}
            className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              required
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              required
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              required
            />

            <div className="flex items-center gap-4 text-sm text-slate-200">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isInstant}
                  onChange={() => setIsInstant(true)}
                />
                Instant
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isInstant}
                  onChange={() => setIsInstant(false)}
                />
                Scheduled
              </label>
            </div>

            {!isInstant && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Alert"}
            </button>
          </form>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
