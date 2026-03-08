"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getParticipantDashboard } from "@/services/participant.service";
import { certificateService } from "@/services/certificate.service";
import { leaderboardService } from "@/services/leaderboard.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { ToastMessage } from "@/components/ui/ToastMessage";

interface Registration {
  eventId: string;
  eventName: string;
  status: string;
  teamId: string;
  teamName: string;
  members?: string[];
  submissionId?: string;
}

interface ParticipantData {
  user?: { id: string; name: string; email: string };
  approvedEvents: number;
  submissions: number;
  certificates: number;
  registeredEvents: Registration[];
  teamMembers: {
    eventId: string;
    eventName: string;
    teamId: string;
    teamName: string;
    members: string[];
  }[];
  leaderboardPosition: number | null;
  hasCertificates: string[];
}

interface LeaderboardPosition {
  published: boolean;
  rank: number | null;
}

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-900/40 border-green-700 text-green-400",
  pending: "bg-yellow-900/40 border-yellow-700 text-yellow-400",
  rejected: "bg-red-900/40 border-red-700 text-red-400",
};

export default function ParticipantDashboard() {
  const [data, setData] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positions, setPositions] = useState<Record<string, LeaderboardPosition>>({});
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getParticipantDashboard()
      .then((dashboardData) => setData(dashboardData))
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const registrations = data?.registeredEvents ?? [];
    if (registrations.length === 0) return;

    const loadPositions = async () => {
      setPositionsLoading(true);
      const uniqueByEvent = new Map(registrations.map((r) => [r.eventId, r]));

      const results = await Promise.all(
        Array.from(uniqueByEvent.values()).map(async (registration) => {
          try {
            const leaderboard = await leaderboardService.get(registration.eventId);
            const entry = leaderboard.entries.find((e) => e.teamId === registration.teamId);
            return [
              registration.eventId,
              { published: leaderboard.published, rank: entry?.rank ?? null },
            ] as const;
          } catch {
            return [registration.eventId, { published: false, rank: null }] as const;
          }
        }),
      );

      setPositions(Object.fromEntries(results));
      setPositionsLoading(false);
    };

    loadPositions();
  }, [data]);

  const downloadCert = async (eventId: string, teamId: string) => {
    setDownloading(eventId);
    try {
      const blob = await certificateService.download(eventId, teamId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${eventId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ ok: true, msg: "Certificate downloaded." });
    } catch {
      setToast({ ok: false, msg: "Certificate not available yet." });
    } finally {
      setDownloading(null);
    }
  };

  const registrations = data?.registeredEvents ?? [];
  const teamMembers = data?.teamMembers ?? [];
  const downloadableCertificates = registrations.filter((r) =>
    data?.hasCertificates.includes(r.eventId),
  );

  const positionLabel = (eventId: string) => {
    const pos = positions[eventId];
    if (!pos) return "Not available";
    if (!pos.published) return "Not published";
    if (pos.rank) return `#${pos.rank}`;
    if (typeof data?.leaderboardPosition === "number") return `#${data.leaderboardPosition}`;
    return "Not ranked";
  };

  if (loading) return <PageSkeleton rows={4} />;

  const registrationKey = (r: Registration, index: number, section: string) =>
    `${section}-${r.eventId}-${r.teamId}-${index}`;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      <div className="max-w-6xl mx-auto p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {data?.user?.name ?? "Participant"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{data?.user?.email}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Approved",
              value: data?.approvedEvents ?? 0,
            },
            {
              label: "Submissions",
              value: data?.submissions ?? 0,
            },
            { label: "Certificates", value: data?.certificates ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-center"
            >
              <div className="text-3xl font-bold text-blue-400">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">Registered Events</h2>
            <div className="space-y-2 text-sm">
              {registrations.length === 0 && <p className="text-slate-500">No events registered yet.</p>}
              {registrations.map((r, index) => (
                <div
                  key={registrationKey(r, index, "registered")}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
                >
                  <span className="text-slate-200">{r.eventName}</span>
                  <span
                    className={`text-xs font-medium border px-2 py-0.5 rounded capitalize ${
                      STATUS_STYLE[r.status] ?? STATUS_STYLE.pending
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">Team Members</h2>
            <div className="space-y-2 text-sm">
              {teamMembers.length === 0 && <p className="text-slate-500">No team data available.</p>}
              {teamMembers.map((r, index) => (
                <div
                  key={registrationKey(r, index, "members")}
                  className="rounded-lg border border-slate-800 px-3 py-2"
                >
                  <p className="text-slate-200 font-medium">{r.teamName}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {(r.members?.length ? r.members : [data?.user?.name ?? "Member"]).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">Submission Status</h2>
            <div className="space-y-2 text-sm">
              {registrations.length === 0 && <p className="text-slate-500">No submissions yet.</p>}
              {registrations.map((r, index) => (
                <div
                  key={registrationKey(r, index, "submission")}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
                >
                  <span className="text-slate-200">{r.eventName}</span>
                  {r.submissionId ? (
                    <Link
                      href={`/events/${r.eventId}/submissions/${r.submissionId}`}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Repo submitted
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">No submissions yet</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">Leaderboard Position</h2>
            {positionsLoading ? (
              <p className="text-slate-500 text-sm">Loading leaderboard positions...</p>
            ) : (
              <div className="space-y-2 text-sm">
                {registrations.length === 0 && <p className="text-slate-500">No leaderboard entries yet.</p>}
                {registrations.map((r, index) => (
                  <div
                    key={registrationKey(r, index, "position")}
                    className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
                  >
                    <span className="text-slate-200">{r.eventName}</span>
                    <span className="text-xs font-semibold text-cyan-300">{positionLabel(r.eventId)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">Certificate Downloads</h2>
          {downloadableCertificates.length === 0 ? (
            <p className="text-slate-500 text-sm">No certificates available for download yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {downloadableCertificates.map((r) => (
                <button
                  key={`${r.eventId}-cert`}
                  onClick={() => downloadCert(r.eventId, r.teamId)}
                  disabled={downloading === r.eventId}
                  className="rounded-lg border border-emerald-700/60 bg-emerald-900/20 px-3 py-2 text-left text-sm text-emerald-300 transition-colors hover:bg-emerald-900/30 disabled:opacity-60"
                >
                  <p className="font-medium">{r.eventName}</p>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    {downloading === r.eventId ? "Downloading..." : "Download certificate"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
