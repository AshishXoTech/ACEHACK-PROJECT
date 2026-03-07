"use client";

import { useEffect, useState } from "react";
import {
    getEvents,
    getOrganizerAnalytics,
    Event,
    OrganizerAnalytics,
} from "@/services/event.service";
import { getEventSubmissions, Submission } from "@/services/submission.service";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { StatCard } from "@/components/ui/StatCard";
import { SimpleBarChart } from "@/components/ui/SimpleBarChart";
import { Users, Network, Gauge, ClipboardList, Loader2, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function OrganizerAnalyticsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [analytics, setAnalytics] = useState<OrganizerAnalytics | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load events on mount
    useEffect(() => {
        getEvents()
            .then((list) => {
                setEvents(list);
                if (list.length > 0) setSelectedEventId(list[0].id);
            })
            .catch(() => setError("Failed to load events."))
            .finally(() => setEventsLoading(false));
    }, []);

    // Load analytics when event changes
    useEffect(() => {
        if (!selectedEventId) return;
        setLoading(true);
        setError(null);

        Promise.all([
            getOrganizerAnalytics(selectedEventId),
            getEventSubmissions(selectedEventId)
        ])
            .then(([analyticsData, submissionsData]) => {
                setAnalytics(analyticsData);
                setSubmissions(submissionsData);
            })
            .catch((err) =>
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load analytics.")
            )
            .finally(() => setLoading(false));
    }, [selectedEventId]);

    // Data Processing for Charts
    const scores = submissions.filter(s => s.score !== undefined).map(s => s.score!);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "N/A";

    const techStackMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};

    submissions.forEach(sub => {
        if (sub.mlAnalysis) {
            sub.mlAnalysis.techStack?.forEach(tech => {
                techStackMap[tech] = (techStackMap[tech] || 0) + 1;
            });
            if (sub.mlAnalysis.classification) {
                categoryMap[sub.mlAnalysis.classification] = (categoryMap[sub.mlAnalysis.classification] || 0) + 1;
            }
        }
    });

    const techStackData = Object.entries(techStackMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6

    const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }));

    const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#22c55e"];
    const CHART_TT = {
        contentStyle: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 },
        itemStyle: { color: "#e2e8f0" }
    };

    return (
        <RoleGuard allowedRoles={["organizer"]}>
            <DashboardShell>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                                Analytics
                            </h2>
                            <p className="text-xs text-slate-400">
                                Event-level insights — registrations, submissions, and scoring
                                progress.
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

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                        </div>
                    )}

                    {!loading && analytics && (
                        <>
                            {/* Stat Cards */}
                            <div className="card-grid">
                                <StatCard
                                    label="Total teams"
                                    value={analytics.totalTeams}
                                    icon={<Users className="h-4 w-4" />}
                                    trendLabel="Teams registered"
                                    trendValue={`${analytics.totalTeams} active`}
                                    highlight="neutral"
                                />
                                <StatCard
                                    label="Total submissions"
                                    value={analytics.totalSubmissions}
                                    icon={<Network className="h-4 w-4" />}
                                    trendLabel="Projects submitted"
                                    trendValue={`${analytics.totalSubmissions} repositories`}
                                    highlight="positive"
                                />
                                <StatCard
                                    label="Pending evaluations"
                                    value={analytics.pendingEvaluations}
                                    icon={<Gauge className="h-4 w-4" />}
                                    trendLabel="Not yet scored"
                                    trendValue={`${analytics.pendingEvaluations} submissions`}
                                    highlight={analytics.pendingEvaluations > 0 ? "negative" : "positive"}
                                />
                                <StatCard
                                    label="Top teams"
                                    value={analytics.topTeams.length}
                                    icon={<ClipboardList className="h-4 w-4" />}
                                    trendLabel="Visible on leaderboard"
                                    trendValue={
                                        analytics.topTeams.length
                                            ? `${analytics.topTeams.length} teams`
                                            : "Awaiting scoring"
                                    }
                                />
                                <StatCard
                                    label="Average Score"
                                    value={avgScore}
                                    icon={<Target className="h-4 w-4" />}
                                    trendLabel="Across evaluated projects"
                                    trendValue={`${scores.length} scores aggregated`}
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Bar Chart */}
                                <div className="lg:col-span-1 border border-slate-800/80 rounded-xl overflow-hidden bg-[#0a0f1a]">
                                    <SimpleBarChart
                                        title="Top teams by score"
                                        data={analytics.topTeams.map((t) => ({
                                            label: t.teamName,
                                            value: t.score,
                                        }))}
                                    />
                                </div>

                                {/* Categories Pie */}
                                <div className="glass-panel p-4 flex flex-col justify-center border-slate-800/80">
                                    <p className="text-sm font-medium text-slate-100 mb-4 px-2 tracking-tight">Submission Categories</p>
                                    <div className="h-64 w-full">
                                        {categoryData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip {...CHART_TT} />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-500">No categories found.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Tech Stack Pie */}
                                <div className="glass-panel p-4 flex flex-col justify-center border-slate-800/80">
                                    <p className="text-sm font-medium text-slate-100 mb-4 px-2 tracking-tight">Tech Stack Distribution</p>
                                    <div className="h-64 w-full">
                                        {techStackData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={techStackData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                                        {techStackData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip {...CHART_TT} />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-500">No tech stacks found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Top Teams Table */}
                            {analytics.topTeams.length > 0 && (
                                <div className="glass-panel overflow-hidden">
                                    <div className="border-b border-slate-800/80 px-4 py-3">
                                        <p className="text-sm font-medium text-slate-100">
                                            Top teams ranking
                                        </p>
                                    </div>
                                    <div className="table-wrapper overflow-x-auto">
                                        <table className="table min-w-full">
                                            <thead>
                                                <tr>
                                                    <th className="w-16">Rank</th>
                                                    <th>Team</th>
                                                    <th className="text-right">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.topTeams.map((t, idx) => (
                                                    <tr key={t.teamId}>
                                                        <td className="font-mono text-xs text-slate-400">
                                                            #{idx + 1}
                                                        </td>
                                                        <td className="font-medium text-slate-100">
                                                            {t.teamName}
                                                        </td>
                                                        <td className="text-right font-semibold text-cyan-300">
                                                            {t.score}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {!loading && !analytics && !error && selectedEventId && (
                        <div className="glass-panel px-4 py-12 text-center text-sm text-slate-400">
                            No analytics data available for this event yet.
                        </div>
                    )}

                    {!loading && !selectedEventId && !eventsLoading && (
                        <div className="glass-panel px-4 py-12 text-center text-sm text-slate-400">
                            Select an event above to view analytics.
                        </div>
                    )}
                </div>
            </DashboardShell>
        </RoleGuard>
    );
}
