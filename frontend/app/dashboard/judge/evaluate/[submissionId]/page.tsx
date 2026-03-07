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
