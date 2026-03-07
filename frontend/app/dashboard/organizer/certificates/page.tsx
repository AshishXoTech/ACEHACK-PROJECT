"use client";
import { useEffect, useState } from "react";
import { getEvents, Event } from "@/services/event.service";
import { certificateService } from "@/services/certificate.service";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { Award, Loader2 } from "lucide-react";

export default function OrganizerCertificatesPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [eventsLoading, setEventsLoading] = useState(true);
    const [certLoading, setCertLoading] = useState(false);
    const [certResult, setCertResult] = useState<string | null>(null);
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

    const generate = async () => {
        if (!selectedEventId) return;
        setCertLoading(true); setError(null); setCertResult(null);
        try {
            const r = await certificateService.generate(selectedEventId);
            setCertResult(`Generated ${r.generated} certificate(s). ${r.message}`);
        } catch {
            setError("Failed to generate certificates.");
        } finally {
            setCertLoading(false);
        }
    };

    return (
        <RoleGuard allowedRoles={["organizer"]}>
            <DashboardShell>
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                                Event Certificates
                            </h2>
                            <p className="text-xs text-slate-400">
                                Issue participation and winner certificates for all evaluated teams.
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
                                        setCertResult(null);
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

                    <div className="glass-panel max-w-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                                <Award className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-base font-medium text-slate-100">
                                    Mass Generate Certificates
                                </p>
                                <p className="text-sm text-slate-400">
                                    Clicking this will generate printable PDF certificates for every participant registered to the selected event.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={generate}
                            disabled={certLoading || !selectedEventId}
                            className="btn-primary w-full justify-center disabled:opacity-50 mt-4 py-3 text-sm"
                        >
                            {certLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                "Generate All Certificates"
                            )}
                        </button>
                        {certResult && (
                            <p className="text-emerald-400 text-sm mt-2 text-center">✅ {certResult}</p>
                        )}
                    </div>
                </div>
            </DashboardShell>
        </RoleGuard>
    );
}
