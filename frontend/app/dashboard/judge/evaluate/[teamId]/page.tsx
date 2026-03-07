"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import { judgeService } from "@/services/judge.service";

const IS_DEV = process.env.NODE_ENV === "development";

export default function JudgeEvaluateTeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();

  // DUMMY DATA (DEV ONLY): preload sample evaluation values for quick workflow testing.
  const [innovation, setInnovation] = useState(IS_DEV ? 8 : 6);
  const [technical, setTechnical] = useState(IS_DEV ? 7 : 6);
  const [impact, setImpact] = useState(IS_DEV ? 9 : 6);
  const [presentation, setPresentation] = useState(IS_DEV ? 8 : 6);
  const [comments, setComments] = useState(
    IS_DEV
      ? "Strong technical implementation with clear real-world impact."
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = useMemo(
    () => innovation + technical + impact + presentation,
    [innovation, technical, impact, presentation],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await judgeService.submitScore({
        teamId,
        innovation,
        technical,
        impact,
        presentation,
        comments: comments.trim() || undefined,
      });
      setSuccess("Score submitted successfully.");
      setTimeout(() => router.push("/dashboard/judge"), 1200);
    } catch {
      setError("Could not submit score.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["judge"]}>
      <DashboardShell>
        <div className="max-w-3xl space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-slate-50">Judge Evaluation Interface</h1>
            <p className="mt-1 text-sm text-slate-400">Team ID: {teamId}</p>
          </header>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Score</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{total} / 40</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <ScoreInput label="Innovation Score" value={innovation} setValue={setInnovation} />
            <ScoreInput label="Technical Score" value={technical} setValue={setTechnical} />
            <ScoreInput label="Impact Score" value={impact} setValue={setImpact} />
            <ScoreInput label="Presentation Score" value={presentation} setValue={setPresentation} />

            <div>
              <label htmlFor="comments" className="mb-2 block text-sm font-medium text-slate-200">
                Judge Comments (optional)
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                placeholder="Share rationale and feedback..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Score"}
            </button>
          </form>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}

function ScoreInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        <span className="text-sm font-semibold text-cyan-300">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
      <input
        type="number"
        min={1}
        max={10}
        value={value}
        onChange={(e) => setValue(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
        className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
      />
    </div>
  );
}
