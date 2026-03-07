"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  CalendarRange,
  FileText,
  Loader2,
  MapPin,
  Network,
  Users,
  Gauge,
  ClipboardList,
  Share2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { StatCard } from "@/components/ui/StatCard";
import { SimpleBarChart } from "@/components/ui/SimpleBarChart";
import {
  Event,
  OrganizerAnalytics,
  TeamRegistration,
  JudgeAssignment,
  getEvents,
  getEventRegistrations,
  getJudgeAssignmentsForEvent,
  getOrganizerAnalytics,
  publishLeaderboard,
  updateRegistrationStatus,
  sendCredentials,
} from "@/services/event.service";
import { getEventSubmissions, Submission } from "@/services/submission.service";



export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<OrganizerAnalytics | null>(null);
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getEvents();
        if (!isMounted) return;
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0].id);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ??
          err?.message ??
          "Failed to load events.";
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    let isMounted = true;

    const loadEventData = async (eventId: string) => {
      setLoadingEventData(true);
      setError(null);
      try {
        const [analyticsRes, regRes, assignRes, submissionsRes] =
          await Promise.all([
            getOrganizerAnalytics(eventId),
            getEventRegistrations(eventId),
            getJudgeAssignmentsForEvent(eventId),
            getEventSubmissions(eventId),
          ]);

        if (!isMounted) return;
        setAnalytics(analyticsRes);
        setRegistrations(regRes);
        setAssignments(assignRes);
        setSubmissions(submissionsRes);
      } catch (err: any) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ??
          err?.message ??
          "Failed to load event data.";
        setError(message);
      } finally {
        if (isMounted) setLoadingEventData(false);
      }
    };

    loadEventData(selectedEventId);

    return () => {
      isMounted = false;
    };
  }, [selectedEventId]);

  const pendingRegistrations = useMemo(
    () => registrations.filter((r) => r.status === "pending"),
    [registrations],
  );

  const pendingAssignments = useMemo(
    () => assignments.filter((a) => !a.evaluated),
    [assignments],
  );



  const handleRegistrationAction = async (
    teamId: string,
    status: "approved" | "rejected",
  ) => {
    if (!selectedEventId) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await updateRegistrationStatus(
        selectedEventId,
        teamId,
        status,
      );
      setRegistrations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      setSuccessMessage("Registration updated.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to update registration.";
      setError(message);
    }
  };

  const handleSendCredentials = async (teamId: string) => {
    if (!selectedEventId) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await sendCredentials(selectedEventId, teamId);
      setSuccessMessage("Credentials sent to team members.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to send credentials.";
      setError(message);
    }
  };

  const handlePublishLeaderboard = async () => {
    if (!selectedEventId) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await publishLeaderboard(selectedEventId);
      setSuccessMessage("Leaderboard published successfully.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to publish leaderboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  return (
    <RoleGuard allowedRoles={["organizer"]}>
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                Event overview
              </h2>
              <p className="text-xs text-slate-400">
                Configure your hackathon, control registrations, and publish
                results.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="select w-52"
                value={selectedEventId ?? ""}
                onChange={(e) =>
                  setSelectedEventId(e.target.value || null)
                }
              >
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(error || successMessage) && (
            <div className="space-y-2">
              {error && (
                <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          <div className="card-grid">
            <StatCard
              label="Total teams"
              value={analytics?.totalTeams ?? "—"}
              icon={<Users className="h-4 w-4" />}
              trendLabel="Teams registered"
              trendValue={
                analytics ? `${analytics.totalTeams} active` : "Awaiting data"
              }
              highlight="neutral"
            />
            <StatCard
              label="Total submissions"
              value={analytics?.totalSubmissions ?? "—"}
              icon={<Network className="h-4 w-4" />}
              trendLabel="Projects submitted"
              trendValue={
                analytics
                  ? `${analytics.totalSubmissions} repositories`
                  : "Awaiting data"
              }
              highlight="positive"
            />
            <StatCard
              label="Pending evaluations"
              value={analytics?.pendingEvaluations ?? "—"}
              icon={<Gauge className="h-4 w-4" />}
              trendLabel="Not yet scored"
              trendValue={
                analytics
                  ? `${analytics.pendingEvaluations} submissions`
                  : "Awaiting data"
              }
              highlight={
                analytics && analytics.pendingEvaluations > 0
                  ? "negative"
                  : "positive"
              }
            />
            <StatCard
              label="Top teams"
              value={analytics?.topTeams.length ?? 0}
              icon={<ClipboardList className="h-4 w-4" />}
              trendLabel="Visible on leaderboard"
              trendValue={
                analytics && analytics.topTeams.length
                  ? `${analytics.topTeams.length} teams`
                  : "Awaiting scoring"
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="glass-panel p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      Registrations & approvals
                    </p>
                    <p className="text-xs text-slate-400">
                      Approve teams and send credentials directly from here.
                    </p>
                  </div>
                </div>
              </div>
              <div className="table-wrapper overflow-x-auto bg-slate-950/80">
                <table className="table min-w-full">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Members</th>
                      <th>Track</th>
                      <th>Status</th>
                      <th className="w-56">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingEventData && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-slate-400"
                        >
                          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />
                          Loading registrations...
                        </td>
                      </tr>
                    )}
                    {!loadingEventData && registrations.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-slate-400"
                        >
                          No registrations yet. Teams will appear here once
                          they register through the participant dashboard.
                        </td>
                      </tr>
                    )}
                    {!loadingEventData &&
                      registrations.map((reg) => (
                        <tr key={reg.id}>
                          <td className="font-medium text-slate-100">
                            {reg.teamName}
                          </td>
                          <td className="text-xs text-slate-300">
                            {reg.members.join(", ")}
                          </td>
                          <td className="text-xs text-slate-300">
                            {reg.track ?? "—"}
                          </td>
                          <td>
                            <span className="badge capitalize text-xs text-slate-200">
                              {reg.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex flex-wrap items-center gap-2">
                              {reg.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRegistrationAction(
                                        reg.id,
                                        "approved",
                                      )
                                    }
                                    className="btn-primary px-3 py-1 text-xs"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRegistrationAction(
                                        reg.id,
                                        "rejected",
                                      )
                                    }
                                    className="btn-outline px-3 py-1 text-xs"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {reg.status === "approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleSendCredentials(reg.id)}
                                  className="btn-outline inline-flex items-center gap-1 px-3 py-1 text-xs"
                                >
                                  <Share2 className="h-3 w-3" />
                                  Send credentials
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <SimpleBarChart
                title="Top teams by score"
                data={
                  analytics?.topTeams.map((t) => ({
                    label: t.teamName,
                    value: t.score,
                  })) ?? []
                }
              />

              <div className="glass-panel p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      Evaluate & publish
                    </p>
                    <p className="text-xs text-slate-400">
                      Track pending evaluations and publish the leaderboard once
                      judging is complete.
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <p>
                    <span className="font-semibold">
                      Teams not evaluated yet:
                    </span>{" "}
                    {pendingAssignments.length}
                  </p>
                  <p>
                    These entries are derived from judge assignments where{" "}
                    <code className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px]">
                      evaluated = false
                    </code>{" "}
                    in the backend response.
                  </p>
                  <button
                    type="button"
                    disabled={!selectedEventId || loading}
                    onClick={handlePublishLeaderboard}
                    className="btn-primary mt-1 w-full justify-center"
                  >
                    Publish leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center gap-2">
              <Network className="h-4 w-4 text-cyan-300" />
              <div>
                <p className="text-sm font-medium text-slate-100">
                  All submissions
                </p>
                <p className="text-xs text-slate-400">
                  View every project submitted for this event, including AI
                  analysis details from your backend.
                </p>
              </div>
            </div>
            <div className="table-wrapper overflow-x-auto bg-slate-950/80">
              <table className="table min-w-full">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Repo</th>
                    <th>ML classification</th>
                    <th>Tech stack</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEventData && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-slate-400"
                      >
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />
                        Loading submissions...
                      </td>
                    </tr>
                  )}
                  {!loadingEventData && submissions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-slate-400"
                      >
                        No submissions yet. Once teams submit via the
                        participant dashboard, they will appear here with
                        AI-generated metadata.
                      </td>
                    </tr>
                  )}
                  {!loadingEventData &&
                    submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="font-medium text-slate-100">
                          {submission.teamName}
                        </td>
                        <td className="text-xs text-cyan-300 underline">
                          <a
                            href={submission.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Repository
                          </a>
                        </td>
                        <td className="text-xs text-slate-200">
                          {submission.mlAnalysis?.classification ?? "—"}
                        </td>
                        <td className="text-xs text-slate-300">
                          {submission.mlAnalysis?.techStack.join(", ") ?? "—"}
                        </td>
                        <td className="text-xs font-semibold text-cyan-300">
                          {submission.score ?? "—"}
                        </td>
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

