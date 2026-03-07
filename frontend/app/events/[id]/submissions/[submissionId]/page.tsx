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
  score?: number | null;
  status?: "pending" | "submitted" | "evaluated" | string;
  aiAnalysis: AIAnalysis | null;
}

export default function SubmissionDetailPage() {
  const { id: eventId, submissionId } = useParams<{ id: string; submissionId: string }>();
  const isJudge = useSearchParams().get("judge") === "true";

  const [sub, setSub]         = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${API}/events/${eventId}/submissions/${submissionId}`)
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
          <Link href={`/events/${eventId}`} className="hover:text-white transition-colors">Event</Link>
          <span>/</span>
          <Link href={`/events/${eventId}/submissions`} className="hover:text-white transition-colors">Submissions</Link>
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
              href={`/dashboard/judge/evaluate/${submissionId}`}
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
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-center">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Current Score</div>
              {typeof sub.score === "number" ? (
                <div className="text-4xl font-bold text-cyan-300">
                  {sub.score}
                  <span className="text-base text-slate-400"> / 100</span>
                </div>
              ) : (
                <div className="text-sm text-slate-400">Not evaluated yet</div>
              )}
              <div className="text-xs text-slate-500 mt-2 capitalize">
                Status: {sub.status ?? "pending"}
              </div>
            </div>

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
