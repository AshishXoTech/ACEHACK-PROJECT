"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EventWorkspaceLayout } from "@/components/workspace/EventWorkspaceLayout";
import { RoleGuard } from "@/middleware/RoleGuard";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  EventResources,
  getEventResources,
} from "@/services/participant-workspace.service";

function ResourceLink({ label, href }: { label: string; href: string }) {
  if (!href) {
    return <p className="text-sm text-slate-500">Not available</p>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-cyan-300 hover:underline"
    >
      {label}
    </a>
  );
}

export default function EventResourcesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [resources, setResources] = useState<EventResources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEventResources(eventId)
      .then((data) => setResources(data))
      .catch(() => setError("Could not load resources."))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <RoleGuard allowedRoles={["participant"]}>
      <DashboardShell>
        <EventWorkspaceLayout
          eventId={eventId}
          title="Resources"
          subtitle="Everything you need during the hackathon"
        >
          {loading ? (
            <PageSkeleton rows={4} />
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Discord</p>
                  <div className="mt-2">
                    <ResourceLink label="Open Discord" href={resources?.discord || ""} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Rulebook</p>
                  <div className="mt-2">
                    <ResourceLink label="View Rulebook" href={resources?.rulebook || ""} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Datasets</p>
                  <div className="mt-2 space-y-1">
                    {resources?.datasets?.length ? (
                      resources.datasets.map((item) => <ResourceLink key={item} label={item} href={item} />)
                    ) : (
                      <p className="text-sm text-slate-500">No datasets shared yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">API Keys</p>
                  <div className="mt-2 space-y-1">
                    {resources?.apiKeys?.length ? (
                      resources.apiKeys.map((item) => <p key={item} className="text-sm text-slate-200">{item}</p>)
                    ) : (
                      <p className="text-sm text-slate-500">No API keys published.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Mentor Schedule</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {resources?.mentorSchedule || "Mentor schedule will be announced soon."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </EventWorkspaceLayout>
      </DashboardShell>
    </RoleGuard>
  );
}

