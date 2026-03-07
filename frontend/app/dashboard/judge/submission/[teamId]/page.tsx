"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import {
  AIAnalysisResult,
  judgeService,
  JudgeSubmissionDetail,
} from "@/services/judge.service";

const IS_DEV = process.env.NODE_ENV === "development";

// DUMMY DATA (DEV ONLY): remove when real submission endpoint is populated.
const DUMMY_SUBMISSIONS: Record<string, JudgeSubmissionDetail> = {
  "1": {
    teamId: "1",
    teamName: "Code Ninjas",
    eventId: "1",
    eventName: "AI Innovation Hackathon",
    members: [
      { id: "u1", name: "Alice", email: "alice@example.com" },
      { id: "u2", name: "Bob", email: "bob@example.com" },
      { id: "u3", name: "Charlie", email: "charlie@example.com" },
    ],
    submissionId: "1",
    repo: "https://github.com/demo/ai-healthcare",
    demo: "https://youtube.com/demo-video",
    readme: "This project uses machine learning models trained on healthcare datasets to predict disease risk.",
    description:
      "An AI-powered platform that predicts health risks based on symptoms and medical data.",
    status: "submitted",
  },
  "2": {
    teamId: "2",
    teamName: "Dev Wizards",
    eventId: "1",
    eventName: "AI Innovation Hackathon",
    members: [
      { id: "u4", name: "Rahul", email: "rahul@example.com" },
      { id: "u5", name: "Priya", email: "priya@example.com" },
      { id: "u6", name: "Ankit", email: "ankit@example.com" },
    ],
    submissionId: "2",
    repo: "https://github.com/demo/smart-agriculture",
    demo: "https://youtube.com/demo-video-2",
    readme: "IoT and AI based platform to monitor farms and forecast crop health.",
    description:
      "Smart agriculture platform using IoT sensors and AI predictions for irrigation and crop planning.",
    status: "submitted",
  },
};

// DUMMY DATA (DEV ONLY): remove when real AI analysis output is consistently available.
const DUMMY_AI_ANALYSIS: AIAnalysisResult = {
  summary: "AI-based healthcare diagnostic platform.",
  category: "Healthcare AI",
  techStack: ["React", "Node.js", "Python", "TensorFlow"],
  commitFrequency: "37 commits in the last 30 days",
};

export default function JudgeSubmissionDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [submission, setSubmission] = useState<JudgeSubmissionDetail | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    judgeService
      .getSubmissionByTeam(teamId)
      .then((data) => setSubmission(data))
      .catch(() => {
        if (IS_DEV) {
          setSubmission(DUMMY_SUBMISSIONS[teamId] ?? DUMMY_SUBMISSIONS["1"]);
          setAnalysis(DUMMY_AI_ANALYSIS);
          return;
        }
        setError("Could not load submission details.");
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  const runAnalysis = async () => {
    if (!submission) return;
    setAnalyzing(true);
    setError("");
    try {
      const result = await judgeService.analyzeProject({
        repoUrl: submission.repo,
        readme: submission.readme || submission.description || "",
      });
      setAnalysis(result);
    } catch {
      if (IS_DEV) {
        setAnalysis(DUMMY_AI_ANALYSIS);
      } else {
        setError("AI analysis failed.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["judge"]}>
      <DashboardShell>
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
            Loading submission...
          </div>
        ) : !submission ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
            Submission not found.
          </div>
        ) : (
          <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-50">{submission.teamName}</h1>
                <p className="mt-1 text-sm text-slate-400">{submission.eventName}</p>
              </div>
              <Link
                href={`/dashboard/judge/evaluate/${submission.teamId}`}
                className="rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
              >
                Evaluate Team
              </Link>
            </header>

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Members</p>
                  <p className="mt-2 text-sm text-slate-200">
                    {submission.members.map((m) => m.name).join(", ") || "No members listed"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">GitHub Repository</p>
                  <a
                    href={submission.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-cyan-300 hover:underline"
                  >
                    {submission.repo || "Not provided"}
                  </a>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">README Preview</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {submission.readme || "README preview not available."}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Submission Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {submission.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Demo Video</p>
                  {submission.demo ? (
                    <a
                      href={submission.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-cyan-300 hover:underline"
                    >
                      Open Demo
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No demo link provided.</p>
                  )}
                </div>
              </section>

              <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                    AI Analysis
                  </h2>
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="rounded-md border border-blue-500/60 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-200 hover:bg-blue-500/20 disabled:opacity-60"
                  >
                    {analyzing ? "Analyzing..." : "Run Analysis"}
                  </button>
                </div>

                {!analysis ? (
                  <p className="text-sm text-slate-500">
                    Generate README summary, category, tech stack, and commit insights.
                  </p>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Summary</p>
                      <p className="mt-1 text-slate-200">{analysis.summary}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Project Category</p>
                      <p className="mt-1 text-slate-200">{analysis.category}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Tech Stack</p>
                      <p className="mt-1 text-slate-200">
                        {analysis.techStack.length ? analysis.techStack.join(", ") : "Not detected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Commit Frequency</p>
                      <p className="mt-1 text-slate-200">{analysis.commitFrequency}</p>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
