"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { certificateService } from "@/services/certificate.service";
import { leaderboardService } from "@/services/leaderboard.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { ToastMessage } from "@/components/ui/ToastMessage";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface Registration {
  eventId: string;
  eventName: string;
  status: "approved" | "pending" | "rejected";
  teamId: string;
  teamName: string;
  members?: string[];
  submissionId: string | null;
}

interface ParticipantData {
  user: { id: string; name: string; email: string };
  registrations: Registration[];
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
    axios
      .get(`${API}/participant/dashboard`)
      .then((r) => setData(r.data))
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const registrations = data?.registrations ?? [];
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

  const registrations = data?.registrations ?? [];
  const downloadableCertificates = registrations.filter((r) =>
    data?.hasCertificates.includes(r.eventId),
  );

  const positionLabel = (eventId: string) => {
    const pos = positions[eventId];
    if (!pos) return "Not available";
    if (!pos.published) return "Not published";
    if (pos.rank) return `#${pos.rank}`;
    return "Not ranked";
  };

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      <div className="max-w-6xl mx-auto p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {data?.user.name ?? "Participant"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{data?.user.email}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Events Joined", value: registrations.length },
            {
              label: "Approved",
              value: registrations.filter((r) => r.status === "approved").length,
            },
            {
              label: "Submissions",
              value: registrations.filter((r) => r.submissionId).length,
            },
            { label: "Certificates", value: data?.hasCertificates.length ?? 0 },
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
              {registrations.map((r) => (
                <div
                  key={`${r.eventId}-registered`}
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
              {registrations.length === 0 && <p className="text-slate-500">No team data available.</p>}
              {registrations.map((r) => (
                <div
                  key={`${r.eventId}-members`}
                  className="rounded-lg border border-slate-800 px-3 py-2"
                >
                  <p className="text-slate-200 font-medium">{r.teamName}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {(r.members?.length ? r.members : [data?.user.name ?? "Member"]).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">Submission Status</h2>
            <div className="space-y-2 text-sm">
              {registrations.length === 0 && <p className="text-slate-500">No submissions yet.</p>}
              {registrations.map((r) => (
                <div
                  key={`${r.eventId}-submission`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
                >
                  <span className="text-slate-200">{r.eventName}</span>
                  {r.submissionId ? (
                    <Link
                      href={`/events/${r.eventId}/submissions/${r.submissionId}`}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Submitted
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">Pending</span>
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
                {registrations.map((r) => (
                  <div
                    key={`${r.eventId}-position`}
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

        <h2 className="text-lg font-semibold mb-4">My Events</h2>
        {!registrations.length ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center">
            <p className="text-gray-500 mb-4">You have not registered for any events yet.</p>
            <Link
              href="/events"
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Team Members</th>
                  <th className="px-4 py-3 font-medium">Submission</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Leaderboard</th>
                  <th className="px-4 py-3 font-medium">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr
                    key={r.eventId}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/events/${r.eventId}`}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {r.eventName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      {(r.members?.length ? r.members : [data?.user.name ?? "Member"]).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      {r.submissionId ? (
                        <Link
                          href={`/events/${r.eventId}/submissions/${r.submissionId}`}
                          className="text-blue-400 hover:underline text-xs"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-cyan-300">
                      {positionsLoading ? "Loading..." : positionLabel(r.eventId)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/leaderboard/${r.eventId}`}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        View
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {data?.hasCertificates.includes(r.eventId) ? (
                        <button
                          onClick={() => downloadCert(r.eventId, r.teamId)}
                          disabled={downloading === r.eventId}
                          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-3 py-1 rounded text-xs transition-colors"
                        >
                          {downloading === r.eventId ? "..." : "Download"}
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
