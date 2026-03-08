"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import {
  getSponsorAdminList,
  Sponsor,
  updateSponsorAdminStatus,
} from "@/services/sponsor.service";

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string>("");

  const load = async () => {
    try {
      setError("");
      const data = await getSponsorAdminList();
      setSponsors(data);
    } catch {
      setError("Could not load sponsors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAction = async (
    sponsorId: string,
    action: "approve" | "reject" | "request_verification",
  ) => {
    setActionLoading(`${sponsorId}:${action}`);
    try {
      await updateSponsorAdminStatus(sponsorId, action);
      await load();
    } catch {
      setError("Could not update sponsor status.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <RoleGuard allowedRoles={["organizer"]}>
      <DashboardShell>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-50">Admin Sponsor Verification</h1>
          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-400">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">LinkedIn</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                      Loading sponsors...
                    </td>
                  </tr>
                ) : sponsors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                      No sponsor requests found.
                    </td>
                  </tr>
                ) : (
                  sponsors.map((sponsor) => (
                    <tr key={sponsor.id} className="border-b border-slate-800 text-slate-200">
                      <td className="px-4 py-3">{sponsor.companyName}</td>
                      <td className="px-4 py-3">{sponsor.contactEmail}</td>
                      <td className="px-4 py-3">{sponsor.domain || "-"}</td>
                      <td className="px-4 py-3">
                        <a href={sponsor.website} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                          {sponsor.website}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {sponsor.linkedinCompanyPage ? (
                          <a href={sponsor.linkedinCompanyPage} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                            LinkedIn
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        E:{sponsor.emailVerified ? "Y" : "N"} D:{sponsor.domainVerified ? "Y" : "N"} W:{sponsor.websiteVerified ? "Y" : "N"} L:{sponsor.linkedinVerified ? "Y" : "N"}
                      </td>
                      <td className="px-4 py-3">{sponsor.status || "pending"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onAction(sponsor.id, "approve")}
                            disabled={Boolean(actionLoading)}
                            className="rounded border border-emerald-500/60 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200 disabled:opacity-60"
                          >
                            {actionLoading === `${sponsor.id}:approve` ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction(sponsor.id, "reject")}
                            disabled={Boolean(actionLoading)}
                            className="rounded border border-rose-500/60 bg-rose-500/10 px-2 py-1 text-xs text-rose-200 disabled:opacity-60"
                          >
                            {actionLoading === `${sponsor.id}:reject` ? "..." : "Reject"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction(sponsor.id, "request_verification")}
                            disabled={Boolean(actionLoading)}
                            className="rounded border border-amber-500/60 bg-amber-500/10 px-2 py-1 text-xs text-amber-200 disabled:opacity-60"
                          >
                            {actionLoading === `${sponsor.id}:request_verification` ? "..." : "Request Verification"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
