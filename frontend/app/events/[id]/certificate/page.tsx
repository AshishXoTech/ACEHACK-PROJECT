"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EventWorkspaceLayout } from "@/components/workspace/EventWorkspaceLayout";
import { RoleGuard } from "@/middleware/RoleGuard";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { certificateService } from "@/services/certificate.service";
import { getParticipantDashboardData } from "@/services/participant.service";

export default function EventCertificatePage() {
  const { id } = useParams<{ id: string }>();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamStatus, setTeamStatus] = useState<string>("pending");
  const [hasCertificate, setHasCertificate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getParticipantDashboardData()
      .then((data) => {
        const registration = data.registrations.find((r) => r.eventId === id);
        setTeamId(registration?.teamId ?? null);
        setTeamStatus(registration?.status ?? "pending");
        setHasCertificate(data.hasCertificates.includes(id));
      })
      .catch(() => setToast({ ok: false, msg: "Could not load certificate status." }))
      .finally(() => setLoading(false));
  }, [id]);

  const download = async (type: "participation" | "winner") => {
    if (!teamId) return;
    setDownloading(type);
    try {
      const blob = await certificateService.download(id, teamId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-certificate-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ ok: true, msg: `${type === "winner" ? "Winner" : "Participation"} certificate downloaded.` });
    } catch {
      setToast({ ok: false, msg: "Certificate not available." });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["participant"]}>
      <DashboardShell>
        <ToastMessage toast={toast} onClose={() => setToast(null)} />
        <EventWorkspaceLayout
          eventId={id}
          title="Certificates"
          subtitle="Download your certificates once available"
        >
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
              Loading certificates...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Participation Certificate
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {hasCertificate ? "Ready to download." : "Not released yet."}
                </p>
                <button
                  type="button"
                  disabled={!hasCertificate || !teamId || downloading !== null}
                  onClick={() => download("participation")}
                  className="mt-4 rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  {downloading === "participation" ? "Downloading..." : "Download Participation"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Winner Certificate</p>
                <p className="mt-2 text-sm text-slate-300">
                  {hasCertificate && teamStatus === "approved"
                    ? "If issued for your team, download it here."
                    : "Available only after results are published and awarded."}
                </p>
                <button
                  type="button"
                  disabled={!hasCertificate || !teamId || teamStatus !== "approved" || downloading !== null}
                  onClick={() => download("winner")}
                  className="mt-4 rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  {downloading === "winner" ? "Downloading..." : "Download Winner"}
                </button>
              </div>
            </div>
          )}
        </EventWorkspaceLayout>
      </DashboardShell>
    </RoleGuard>
  );
}
