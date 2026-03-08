"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { judgeService, JudgeSubmissionDetails } from "@/services/judge.service";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function JudgeSubmissionPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [data, setData] = useState<JudgeSubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");

  const loadSubmission = () => {
    judgeService
      .getSubmissionByTeam(teamId)
      .then((details) => setData(details))
      .catch(() => setError("Could not load submission details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmission();
  }, [teamId]);

  const runAnalysis = async () => {
    if (!data) return;
    setAnalyzing(true);
    setAnalysisMessage("");
    setError("");
    try {
      console.log("[Judge Submission] Run Analysis clicked for team:", teamId);
      const result = await judgeService.runSubmissionAnalysis(teamId, data.submissionId);
      console.log("[Judge Submission] Analysis response:", result);
      setAnalysisMessage("Analysis completed successfully.");
      loadSubmission();
    } catch (analysisError) {
      console.error("[Judge Submission] Analysis failed:", analysisError);
      setError("Could not run analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={["judge"]}>
        <DashboardShell>
          <PageSkeleton rows={5} />
        </DashboardShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["judge"]}>
      <DashboardShell>
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-50">Submission Details</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="rounded bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm text-slate-100 disabled:opacity-60"
              >
                {analyzing ? "Running..." : "Run Analysis"}
              </button>
              <Link
                href={`/dashboard/judge/evaluate/${teamId}`}
                className="rounded bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm text-white"
              >
                Evaluate
              </Link>
            </div>
          </div>

          {analysisMessage && (
            <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {analysisMessage}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {!data ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
              Submission data unavailable.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Team Name</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{data.teamName}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Project: {data.projectName || data.teamName}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Members</p>
                <ul className="mt-2 space-y-2">
                  {data.members.length === 0 ? (
                    <li className="text-sm text-slate-500">No member details available.</li>
                  ) : (
                    data.members.map((member) => (
                      <li key={member.id} className="text-sm text-slate-200">
                        {member.name} ({member.email})
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Repository Link</p>
                <a
                  href={data.repositoryLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-cyan-300 hover:underline"
                >
                  {data.repositoryLink}
                </a>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">README Preview</p>
                <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">{data.readmePreview}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Submission Description</p>
                <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">
                  {data.description || data.submissionDescription || "No description provided."}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">ML Analysis</p>
                <div className="mt-2 space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">Category:</span>{" "}
                    {data.category || "Unclassified"}
                  </p>
                  <p>
                    <span className="text-slate-500">Tech Stack:</span>{" "}
                    {data.techStack?.length ? data.techStack.join(", ") : "Not detected"}
                  </p>
                  <p>
                    <span className="text-slate-500">Commits:</span>{" "}
                    Total {data.commitStats?.total ?? 0}, 7d {data.commitStats?.last7Days ?? 0}, 30d {data.commitStats?.last30Days ?? 0}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Demo Video</p>
                {data.demoVideo ? (
                  <a
                    href={data.demoVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-cyan-300 hover:underline"
                  >
                    {data.demoVideo}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No demo video shared.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
