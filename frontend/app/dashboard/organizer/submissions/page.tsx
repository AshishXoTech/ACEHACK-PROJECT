"use client";

import { useEffect, useState } from "react";
import { getEvents, Event } from "@/services/event.service";
import { getEventSubmissions, Submission } from "@/services/submission.service";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { Network, Loader2 } from "lucide-react";

export default function OrganizerSubmissionsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (!selectedEventId) return;
        setLoading(true);
        setError(null);
        getEventSubmissions(selectedEventId)
            .then(setSubmissions)
            .catch((err) =>
                setError(
                    err?.response?.data?.message ?? err?.message ?? "Failed to load submissions."
                )
            )
            .finally(() => setLoading(false));
    }, [selectedEventId]);

    return (
        <RoleGuard allowedRoles={["organizer"]}>
            <DashboardShell>
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                                Submissions
                            </h2>
                            <p className="text-xs text-slate-400">
                                Team project submissions with ML classification insights.
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

                    <div className="glass-panel overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-slate-800/80 px-4 py-3">
                            <Network className="h-4 w-4 text-cyan-300" />
                            <p className="text-sm font-medium text-slate-100">All submissions</p>
                            {!loading && submissions.length > 0 && (
                                <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                                    {submissions.length} total
                                </span>
                            )}
                        </div>

                        <div className="table-wrapper overflow-x-auto">
                            <table className="table min-w-full">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Project</th>
                                        <th>ML Classification</th>
                                        <th>Tech Stack</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                                <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />
                                                Loading submissions...
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && !selectedEventId && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                                Select an event above to view submissions.
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && selectedEventId && submissions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                                No submissions yet.
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && submissions.map((sub) => (
                                        <tr key={sub.id}>
                                            <td className="font-medium text-slate-100">{sub.teamName}</td>
                                            <td className="text-xs text-slate-200">{sub.projectName || sub.teamName}</td>
                                            <td className="text-xs text-slate-200">{sub.mlAnalysis?.classification ?? "-"}</td>
                                            <td className="text-xs text-slate-300">{sub.mlAnalysis?.techStack?.join(", ") ?? "-"}</td>
                                            <td className="text-xs font-semibold text-cyan-300">{sub.score ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardShell>
        </RoleGuard>
    );
}
