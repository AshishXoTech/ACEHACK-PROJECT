#!/usr/bin/env node
/**
 * build-zip.js
 * Generates hackflow_frontend_remaining_features.zip
 * Run: node build-zip.js
 */
const fs   = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TMP = path.join(__dirname, "__hf2_tmp__");
if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });
fs.mkdirSync(TMP);

function w(rel, content) {
  const abs = path.join(TMP, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.trimStart(), "utf8");
  console.log("  ✅  " + rel);
}

/* ============================================================
   services/judge.service.ts
   ============================================================ */
w("services/judge.service.ts", `
import api from "./api";

export interface JudgeAssignment {
  teamId: string;
  teamName: string;
  judgeId: string | null;
  judgeName: string | null;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
}

export interface AssignedTeam {
  teamId: string;
  teamName: string;
  eventId: string;
  eventName: string;
  submissionId: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  evaluated: boolean;
  score: number | null;
}

export interface EvaluationPayload {
  innovation: number;
  technicalComplexity: number;
  practicalImpact: number;
  presentation: number;
  feedback?: string;
}

export const judgeService = {
  getAssignments: (eventId: string) =>
    api.get<{ assignments: JudgeAssignment[]; judges: Judge[] }>(
      \`/events/\${eventId}/judge-assignments\`
    ).then(r => r.data),

  assignJudge: (eventId: string, teamId: string, judgeId: string) =>
    api.post(\`/events/\${eventId}/assign-judge\`, { teamId, judgeId }).then(r => r.data),

  getAssignedTeams: () =>
    api.get<{ teams: AssignedTeam[] }>("/judge/assigned-teams").then(r => r.data),

  submitEvaluation: (submissionId: string, payload: EvaluationPayload) =>
    api.post(\`/submissions/\${submissionId}/evaluate\`, payload).then(r => r.data),
};
`);

/* ============================================================
   services/certificate.service.ts
   ============================================================ */
w("services/certificate.service.ts", `
import api from "./api";

export const certificateService = {
  generate: (eventId: string) =>
    api.post<{ generated: number; message: string }>(
      \`/events/\${eventId}/certificates/generate\`
    ).then(r => r.data),

  download: (eventId: string, teamId: string) =>
    api.get(\`/events/\${eventId}/certificates/\${teamId}\`, { responseType: "blob" })
      .then(r => r.data),
};
`);

/* ============================================================
   services/leaderboard.service.ts
   ============================================================ */
w("services/leaderboard.service.ts", `
import api from "./api";

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
}

export interface LeaderboardData {
  published: boolean;
  entries: LeaderboardEntry[];
}

export const leaderboardService = {
  get: (eventId: string) =>
    api.get<LeaderboardData>(\`/events/\${eventId}/leaderboard\`).then(r => r.data),

  publish: (eventId: string) =>
    api.post(\`/events/\${eventId}/leaderboard/publish\`).then(r => r.data),
};
`);

/* ============================================================
   components/ui/LoadingSkeleton.tsx
   ============================================================ */
w("components/ui/LoadingSkeleton.tsx", `
export function RowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-800 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 animate-pulse space-y-3">
      <div className="h-5 bg-slate-700 rounded w-1/3" />
      <div className="h-4 bg-slate-700 rounded w-2/3" />
      <div className="h-4 bg-slate-700 rounded w-1/2" />
    </div>
  );
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-[#020617] p-10">
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-48 mb-8" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-[#0f172a] rounded-xl border border-slate-800" />
        ))}
      </div>
    </div>
  );
}
`);

/* ============================================================
   components/ai/AIAnalysisChart.tsx
   ============================================================ */
w("components/ai/AIAnalysisChart.tsx", `
"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

interface AIAnalysis {
  codeQuality: number;
  innovation: number;
  complexity: number;
  readability: number;
  usability: number;
  techStack?: { name: string; confidence: number }[];
}

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6","#06b6d4"];
const TT = {
  contentStyle: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: "#94a3b8" },
};

export default function AIAnalysisChart({ analysis }: { analysis: AIAnalysis }) {
  const radarData = [
    { subject: "Code Quality", value: analysis.codeQuality },
    { subject: "Innovation",   value: analysis.innovation  },
    { subject: "Complexity",   value: analysis.complexity  },
    { subject: "Readability",  value: analysis.readability },
    { subject: "Usability",    value: analysis.usability   },
  ];

  const stackData = (analysis.techStack ?? []).map(t => ({
    name: t.name,
    confidence: Math.round(t.confidence * 100),
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Score Breakdown</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#475569", fontSize: 10 }} />
            <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip {...TT} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {stackData.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Tech Stack Confidence</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stackData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={(v: number) => [\`\${v}%\`, "Confidence"]} />
              <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                {stackData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
`);

/* ============================================================
   app/dashboard/organizer/judges/page.tsx
   ============================================================ */
w("app/dashboard/organizer/judges/page.tsx", `
"use client";
import { useEffect, useState, useTransition } from "react";
import { judgeService, JudgeAssignment, Judge } from "@/services/judge.service";
import { RowSkeleton } from "@/components/ui/LoadingSkeleton";

export default function JudgeAssignmentPage() {
  const [eventId, setEventId]         = useState("");
  const [loadedId, setLoadedId]       = useState("");
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [judges, setJudges]           = useState<Judge[]>([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState<string | null>(null);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);
  const [, startTransition]           = useTransition();

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    if (!eventId.trim()) return;
    setLoading(true);
    try {
      const data = await judgeService.getAssignments(eventId.trim());
      setAssignments(data.assignments);
      setJudges(data.judges);
      setLoadedId(eventId.trim());
    } catch {
      notify("Failed to load assignments.", false);
    } finally {
      setLoading(false);
    }
  };

  const assign = async (teamId: string, judgeId: string) => {
    setSaving(teamId);
    try {
      await judgeService.assignJudge(loadedId, teamId, judgeId);
      startTransition(() => {
        setAssignments(prev =>
          prev.map(a =>
            a.teamId === teamId
              ? { ...a, judgeId, judgeName: judges.find(j => j.id === judgeId)?.name ?? null }
              : a
          )
        );
      });
      notify("Judge assigned successfully.");
    } catch {
      notify("Failed to assign judge.", false);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">
        {toast && (
          <div className={\`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg \${
            toast.ok ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
          }\`}>
            {toast.msg}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-8">Judge Assignment</h1>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Enter Event ID…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={load}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            {loading ? "Loading…" : "Load Assignments"}
          </button>
        </div>

        {loadedId && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Current Judge</th>
                  <th className="px-4 py-3 font-medium">Assign Judge</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} cols={4} />)
                  : assignments.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No teams found for this event.
                      </td>
                    </tr>
                  )
                  : assignments.map(a => (
                    <AssignRow
                      key={a.teamId}
                      assignment={a}
                      judges={judges}
                      saving={saving === a.teamId}
                      onAssign={judgeId => assign(a.teamId, judgeId)}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignRow({
  assignment, judges, saving, onAssign,
}: {
  assignment: JudgeAssignment;
  judges: Judge[];
  saving: boolean;
  onAssign: (judgeId: string) => void;
}) {
  const [selected, setSelected] = useState(assignment.judgeId ?? "");
  useEffect(() => { setSelected(assignment.judgeId ?? ""); }, [assignment.judgeId]);

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 font-medium text-white">{assignment.teamName}</td>
      <td className="px-4 py-3 text-gray-400">
        {assignment.judgeName ?? <span className="italic text-gray-600">Unassigned</span>}
      </td>
      <td className="px-4 py-3">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">— Select judge —</option>
          {judges.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => selected && onAssign(selected)}
          disabled={saving || !selected}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-3 py-1 rounded text-sm transition-colors"
        >
          {saving ? "Saving…" : "Assign"}
        </button>
      </td>
    </tr>
  );
}
`);

/* ============================================================
   app/dashboard/judge/page.tsx
   ============================================================ */
w("app/dashboard/judge/page.tsx", `
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { judgeService, AssignedTeam } from "@/services/judge.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function JudgeDashboard() {
  const [teams, setTeams]     = useState<AssignedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    judgeService.getAssignedTeams()
      .then(d => setTeams(d.teams))
      .catch(() => setError("Could not load assigned teams."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton rows={5} />;

  const pending   = teams.filter(t => !t.evaluated);
  const completed = teams.filter(t =>  t.evaluated);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">
        <h1 className="text-2xl font-bold mb-2">Judge Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">
          {teams.length} team{teams.length !== 1 ? "s" : ""} assigned to you
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Assigned", value: teams.length,    color: "text-blue-400"   },
            { label: "Pending",        value: pending.length,  color: "text-yellow-400" },
            { label: "Evaluated",      value: completed.length,color: "text-green-400"  },
          ].map(s => (
            <div key={s.label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
              <div className={\`text-3xl font-bold \${s.color}\`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <TeamSection title="Pending Evaluations" teams={pending} />

        {completed.length > 0 && (
          <TeamSection title="Completed" teams={completed} done className="mt-8" />
        )}
      </div>
    </div>
  );
}

function TeamSection({ title, teams, done = false, className = "" }: {
  title: string; teams: AssignedTeam[]; done?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="bg-slate-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{teams.length}</span>
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">None yet.</p>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Repo</th>
                <th className="px-4 py-3 font-medium">Demo</th>
                {done && <th className="px-4 py-3 font-medium">Score</th>}
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.teamId} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{t.teamName}</td>
                  <td className="px-4 py-3 text-gray-400">{t.eventName}</td>
                  <td className="px-4 py-3">
                    {t.repoUrl
                      ? <a href={t.repoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Repo ↗</a>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {t.demoUrl
                      ? <a href={t.demoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Demo ↗</a>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  {done && (
                    <td className="px-4 py-3 font-semibold text-green-400">{t.score ?? "—"}</td>
                  )}
                  <td className="px-4 py-3">
                    {t.submissionId ? (
                      <Link
                        href={\`/dashboard/judge/evaluate/\${t.submissionId}\`}
                        className={\`px-3 py-1 rounded text-sm transition-colors \${
                          done
                            ? "bg-slate-700 hover:bg-slate-600 text-gray-300"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }\`}
                      >
                        {done ? "Re-evaluate" : "Evaluate"}
                      </Link>
                    ) : (
                      <span className="text-gray-600 text-xs">No submission</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

/* ============================================================
   app/dashboard/judge/evaluate/[submissionId]/page.tsx
   ============================================================ */
w("app/dashboard/judge/evaluate/[submissionId]/page.tsx", `
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { judgeService, EvaluationPayload } from "@/services/judge.service";

const CRITERIA: { key: keyof Omit<EvaluationPayload,"feedback">; label: string; desc: string }[] = [
  { key: "innovation",          label: "Innovation",           desc: "Originality and creative problem solving"         },
  { key: "technicalComplexity", label: "Technical Complexity", desc: "Depth and quality of technical implementation"    },
  { key: "practicalImpact",     label: "Practical Impact",     desc: "Real-world applicability and potential impact"    },
  { key: "presentation",        label: "Presentation",         desc: "Clarity of communication and quality of the demo" },
];

type Scores = Omit<EvaluationPayload, "feedback">;

export default function EvaluatePage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const router           = useRouter();

  const [scores,     setScores]     = useState<Scores>({ innovation: 5, technicalComplexity: 5, practicalImpact: 5, presentation: 5 });
  const [feedback,   setFeedback]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState("");

  const total = Math.round(
    (scores.innovation + scores.technicalComplexity + scores.practicalImpact + scores.presentation) * 2.5
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await judgeService.submitEvaluation(submissionId, { ...scores, feedback });
      setDone(true);
      setTimeout(() => router.push("/dashboard/judge"), 2000);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white">Evaluation Submitted</h2>
          <p className="text-gray-400 text-sm mt-2">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-2xl mx-auto p-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-1">Evaluate Submission</h1>
        <p className="text-gray-400 text-sm mb-8">Submission ID: {submissionId}</p>

        {/* Live score */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 mb-6 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Calculated Total Score</span>
          <span className="text-4xl font-bold text-blue-400">
            {total}<span className="text-lg text-gray-500">/100</span>
          </span>
        </div>

        {/* Criteria sliders */}
        <div className="space-y-5 mb-6">
          {CRITERIA.map(c => (
            <div key={c.key} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-white">{c.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{c.desc}</div>
                </div>
                <span className="text-2xl font-bold text-blue-400">{scores[c.key]}</span>
              </div>
              <input
                type="range" min={1} max={10} step={1}
                value={scores[c.key]}
                onChange={e => setScores(p => ({ ...p, [c.key]: Number(e.target.value) }))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1 — Poor</span><span>10 — Excellent</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Feedback (optional)</label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={4}
            placeholder="Share constructive feedback for the team…"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded font-semibold text-sm transition-colors"
        >
          {submitting ? "Submitting…" : "Submit Evaluation"}
        </button>
      </div>
    </div>
  );
}
`);

/* ============================================================
   app/events/[id]/submissions/[submissionId]/page.tsx
   ============================================================ */
w("app/events/[id]/submissions/[submissionId]/page.tsx", `
"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AIAnalysisChart from "@/components/ai/AIAnalysisChart";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface AIAnalysis {
  overallScore: number;
  codeQuality: number;
  innovation: number;
  complexity: number;
  readability: number;
  usability: number;
  category: string;
  techStack: { name: string; confidence: number }[];
  summary: string;
  strengths: string[];
  improvements: string[];
}

interface Submission {
  id: string;
  teamName: string;
  repoUrl: string;
  demoUrl: string;
  summary: string;
  techStack: string[];
  aiAnalysis: AIAnalysis | null;
}

export default function SubmissionDetailPage() {
  const { id: eventId, submissionId } = useParams<{ id: string; submissionId: string }>();
  const isJudge = useSearchParams().get("judge") === "true";

  const [sub, setSub]         = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(\`\${API}/events/\${eventId}/submissions/\${submissionId}\`)
      .then(r => setSub(r.data))
      .catch(() => setError("Could not load submission."))
      .finally(() => setLoading(false));
  }, [eventId, submissionId]);

  if (loading) return <PageSkeleton rows={6} />;
  if (error || !sub) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-red-400">{error || "Submission not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">

        {/* Breadcrumb */}
        <nav className="text-gray-500 text-xs mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/events" className="hover:text-white transition-colors">Events</Link>
          <span>/</span>
          <Link href={\`/events/\${eventId}\`} className="hover:text-white transition-colors">Event</Link>
          <span>/</span>
          <Link href={\`/events/\${eventId}/submissions\`} className="hover:text-white transition-colors">Submissions</Link>
          <span>/</span>
          <span className="text-gray-300">Details</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{sub.teamName}</h1>
            <p className="text-gray-400 text-sm mt-1">Submission #{sub.id.slice(-6).toUpperCase()}</p>
          </div>
          {isJudge && (
            <Link
              href={\`/dashboard/judge/evaluate/\${submissionId}\`}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Evaluate This Submission
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Summary */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
              <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Project Summary</h2>
              <p className="text-gray-200 leading-relaxed text-sm">{sub.summary}</p>
            </div>

            {/* Links */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
              <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Links</h2>
              <div className="flex flex-wrap gap-3">
                <a href={sub.repoUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-4 py-2 text-sm transition-colors">
                  🔗 Repository
                </a>
                <a href={sub.demoUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-4 py-2 text-sm transition-colors">
                  🚀 Live Demo
                </a>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
              <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {sub.techStack.map(t => (
                  <span key={t} className="bg-slate-800 border border-slate-700 text-blue-300 text-xs font-mono px-3 py-1.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Analysis charts */}
            {sub.aiAnalysis && (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
                <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">AI Analysis</h2>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">{sub.aiAnalysis.summary}</p>
                <AIAnalysisChart analysis={sub.aiAnalysis} />
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {sub.aiAnalysis && (
              <>
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-center">
                  <div className="text-5xl font-bold text-blue-400">{sub.aiAnalysis.overallScore}</div>
                  <div className="text-gray-400 text-xs mt-1">Overall Score / 10</div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Category</h3>
                  <span className="bg-blue-900/40 border border-blue-700 text-blue-300 text-sm px-3 py-1 rounded">
                    {sub.aiAnalysis.category}
                  </span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Strengths</h3>
                  <ul className="space-y-1.5">
                    {sub.aiAnalysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-gray-300 flex gap-2">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Areas to Improve</h3>
                  <ul className="space-y-1.5">
                    {sub.aiAnalysis.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-gray-300 flex gap-2">
                        <span className="text-yellow-400 mt-0.5 shrink-0">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`);

/* ============================================================
   app/leaderboard/[eventId]/page.tsx
   ============================================================ */
w("app/leaderboard/[eventId]/page.tsx", `
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { leaderboardService, LeaderboardEntry } from "@/services/leaderboard.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [entries,   setEntries]   = useState<LeaderboardEntry[]>([]);
  const [published, setPublished] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [visible,   setVisible]   = useState<Set<number>>(new Set());

  useEffect(() => {
    leaderboardService.get(eventId)
      .then(d => {
        setEntries(d.entries);
        setPublished(d.published);
        d.entries.forEach((_, i) => {
          setTimeout(() => setVisible(p => { const n = new Set(p); n.add(i); return n; }), i * 70);
        });
      })
      .catch(() => setError("Could not load leaderboard."))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <PageSkeleton rows={8} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              {published ? "✅ Results published" : "⏳ Results not yet published"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {entries.length === 0 && !error ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center text-gray-500">
            No results available yet.
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium w-20">Rank</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr
                    key={e.teamId}
                    style={{ transitionDelay: \`\${i * 40}ms\` }}
                    className={\`border-b border-slate-800 last:border-0 transition-all duration-500 \${
                      visible.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    } \${e.rank <= 3 ? "bg-slate-800/30" : "hover:bg-slate-800/20"}\`}
                  >
                    <td className="px-4 py-3 text-lg font-bold">
                      {MEDALS[e.rank] ?? <span className="text-gray-500 text-sm font-mono">#{e.rank}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{e.teamName}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={
                        e.rank === 1 ? "text-yellow-400 text-lg" :
                        e.rank === 2 ? "text-gray-300" :
                        e.rank === 3 ? "text-amber-600" :
                        "text-blue-400"
                      }>
                        {e.score}
                      </span>
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
`);

/* ============================================================
   app/leaderboard/page.tsx
   ============================================================ */
w("app/leaderboard/page.tsx", `
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardIndex() {
  const [eventId, setEventId] = useState("");
  const router = useRouter();
  const go = () => eventId.trim() && router.push(\`/leaderboard/\${eventId.trim()}\`);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8 text-white">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 w-full max-w-md text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h1 className="text-xl font-bold mb-2">View Leaderboard</h1>
        <p className="text-gray-400 text-sm mb-6">Enter an Event ID to view the rankings.</p>
        <div className="flex gap-2">
          <input
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && go()}
            placeholder="Event ID…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={go}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
`);

/* ============================================================
   app/dashboard/organizer/leaderboard/page.tsx
   ============================================================ */
w("app/dashboard/organizer/leaderboard/page.tsx", `
"use client";
import { useState } from "react";
import Link from "next/link";
import { leaderboardService } from "@/services/leaderboard.service";
import { certificateService } from "@/services/certificate.service";

export default function OrganizerLeaderboardPage() {
  const [eventId,    setEventId]    = useState("");
  const [pubLoading, setPubLoading] = useState(false);
  const [certLoading,setCertLoading]= useState(false);
  const [pubResult,  setPubResult]  = useState<string | null>(null);
  const [certResult, setCertResult] = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const publish = async () => {
    if (!eventId.trim()) return;
    setPubLoading(true); setError(null); setPubResult(null);
    try {
      await leaderboardService.publish(eventId.trim());
      setPubResult("Leaderboard published successfully!");
    } catch {
      setError("Failed to publish leaderboard.");
    } finally {
      setPubLoading(false);
    }
  };

  const generate = async () => {
    if (!eventId.trim()) return;
    setCertLoading(true); setError(null); setCertResult(null);
    try {
      const r = await certificateService.generate(eventId.trim());
      setCertResult(\`Generated \${r.generated} certificate(s). \${r.message}\`);
    } catch {
      setError("Failed to generate certificates.");
    } finally {
      setCertLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">
        <h1 className="text-2xl font-bold mb-2">Publish & Certificates</h1>
        <p className="text-gray-400 text-sm mb-8">Finalise results and issue certificates to participants.</p>

        {/* Event ID */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Event ID</label>
          <input
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            placeholder="Enter Event ID…"
            className="w-full max-w-md bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Publish leaderboard */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold mb-1">Publish Leaderboard</h2>
            <p className="text-gray-400 text-sm mb-4">
              Make the leaderboard visible to all participants and the public.
            </p>
            <button
              onClick={publish}
              disabled={pubLoading || !eventId.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {pubLoading ? "Publishing…" : "Publish Leaderboard"}
            </button>
            {pubResult && (
              <p className="text-green-400 text-xs mt-3">✅ {pubResult}</p>
            )}
          </div>

          {/* Generate certificates */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold mb-1">Generate Certificates</h2>
            <p className="text-gray-400 text-sm mb-4">
              Create participation and winner certificates for all teams.
            </p>
            <button
              onClick={generate}
              disabled={certLoading || !eventId.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {certLoading ? "Generating…" : "Generate Certificates"}
            </button>
            {certResult && (
              <p className="text-green-400 text-xs mt-3">✅ {certResult}</p>
            )}
          </div>
        </div>

        {eventId.trim() && (
          <Link
            href={\`/leaderboard/\${eventId.trim()}\`}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            View public leaderboard for this event →
          </Link>
        )}
      </div>
    </div>
  );
}
`);

/* ============================================================
   app/dashboard/participant/page.tsx
   ============================================================ */
w("app/dashboard/participant/page.tsx", `
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { certificateService } from "@/services/certificate.service";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface Registration {
  eventId: string;
  eventName: string;
  status: "approved" | "pending" | "rejected";
  teamId: string;
  teamName: string;
  submissionId: string | null;
}

interface ParticipantData {
  user: { id: string; name: string; email: string };
  registrations: Registration[];
  hasCertificates: string[];
}

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-900/40 border-green-700 text-green-400",
  pending:  "bg-yellow-900/40 border-yellow-700 text-yellow-400",
  rejected: "bg-red-900/40 border-red-700 text-red-400",
};

export default function ParticipantDashboard() {
  const [data,        setData]        = useState<ParticipantData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    axios.get(\`\${API}/participant/dashboard\`)
      .then(r => setData(r.data))
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const downloadCert = async (eventId: string, teamId: string) => {
    setDownloading(eventId);
    try {
      const blob = await certificateService.download(eventId, teamId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = \`certificate-\${eventId}.pdf\`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Certificate not available yet.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto p-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {data?.user.name ?? "Participant"} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">{data?.user.email}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Events Joined",  value: data?.registrations.length ?? 0 },
            { label: "Approved",       value: data?.registrations.filter(r => r.status === "approved").length ?? 0 },
            { label: "Submissions",    value: data?.registrations.filter(r => r.submissionId).length ?? 0 },
            { label: "Certificates",   value: data?.hasCertificates.length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-blue-400">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Registrations */}
        <h2 className="text-lg font-semibold mb-4">My Events</h2>

        {!data?.registrations.length ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center">
            <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
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
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submission</th>
                  <th className="px-4 py-3 font-medium">Leaderboard</th>
                  <th className="px-4 py-3 font-medium">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {data.registrations.map(r => (
                  <tr
                    key={r.eventId}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link href={\`/events/\${r.eventId}\`} className="hover:text-blue-400 transition-colors">
                        {r.eventName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.teamName}</td>
                    <td className="px-4 py-3">
                      <span className={\`text-xs font-medium border px-2 py-0.5 rounded capitalize \${STATUS_STYLE[r.status]}\`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.submissionId ? (
                        <Link
                          href={\`/events/\${r.eventId}/submissions/\${r.submissionId}\`}
                          className="text-blue-400 hover:underline text-xs"
                        >
                          View →
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={\`/leaderboard/\${r.eventId}\`}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        View →
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {data.hasCertificates.includes(r.eventId) ? (
                        <button
                          onClick={() => downloadCert(r.eventId, r.teamId)}
                          disabled={downloading === r.eventId}
                          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-3 py-1 rounded text-xs transition-colors"
                        >
                          {downloading === r.eventId ? "…" : "Download"}
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
`);

/* ============================================================
   ZIP
   ============================================================ */
const OUT = path.join(__dirname, "hackflow_frontend_remaining_features.zip");
if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
execSync(`cd "${TMP}" && zip -r "${OUT}" .`, { stdio: "inherit" });
fs.rmSync(TMP, { recursive: true });

console.log("\n🎉  hackflow_frontend_remaining_features.zip  →  " + OUT);
