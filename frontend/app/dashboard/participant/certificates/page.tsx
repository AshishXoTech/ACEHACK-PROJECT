"use client";

import { useEffect, useState } from "react";
import { getParticipantDashboardData, ParticipantDashboardData } from "@/services/participant.service";
import { certificateService } from "@/services/certificate.service";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { Award, Download, Loader2 } from "lucide-react";

export default function ParticipantCertificatesPage() {
    const [data, setData] = useState<ParticipantDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

    useEffect(() => {
        getParticipantDashboardData()
            .then(setData)
            .catch((err: unknown) => {
                const message =
                    typeof err === "object" &&
                    err !== null &&
                    "response" in err &&
                    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
                        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                        : "Failed to load certificates.";
                setError(message);
            })
            .finally(() => setLoading(false));
    }, []);

    const downloadCert = async (eventId: string, teamId: string) => {
        setDownloading(eventId);
        try {
            const blob = await certificateService.download(eventId, teamId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `certificate-${eventId}-${teamId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            setToast({ ok: true, msg: "Certificate downloaded." });
        } catch {
            setToast({ ok: false, msg: "Failed to download certificate." });
        } finally {
            setDownloading(null);
        }
    };

    const eligibleEvents =
        data?.registrations.filter((r) => data.hasCertificates.includes(r.eventId)) || [];

    return (
        <RoleGuard allowedRoles={["participant"]}>
            <DashboardShell>
                <ToastMessage toast={toast} onClose={() => setToast(null)} />
                <div className="space-y-6 max-w-4xl mx-auto">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-50">
                            My Certificates
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Download your verified participation and winner certificates.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                        </div>
                    ) : eligibleEvents.length === 0 ? (
                        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-4 rounded-full bg-slate-800/50">
                                <Award className="h-8 w-8 text-slate-500" />
                            </div>
                            <p className="text-slate-300 font-medium">No certificates available yet</p>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                Certificates will appear here once the hackathon organizer has evaluated the projects and published the final results.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {eligibleEvents.map((r) => (
                                <div key={r.eventId} className="glass-panel p-5 flex flex-col items-center text-center relative overflow-hidden group">
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                                    <div className="mt-2 mb-4 p-4 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                                        <Award className="h-8 w-8 text-cyan-400" />
                                    </div>

                                    <h3 className="text-slate-100 font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full">
                                        {r.eventName}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-5">
                                        Team: {r.teamName}
                                    </p>

                                    <button
                                        onClick={() => downloadCert(r.eventId, r.teamId)}
                                        disabled={downloading === r.eventId}
                                        className="btn-primary w-full justify-center mt-auto"
                                    >
                                        {downloading === r.eventId ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> downloading</>
                                        ) : (
                                            <><Download className="mr-2 h-4 w-4" /> Download PDF</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardShell>
        </RoleGuard>
    );
}
