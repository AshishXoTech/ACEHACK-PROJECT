"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EventWorkspaceLayout } from "@/components/workspace/EventWorkspaceLayout";
import { RoleGuard } from "@/middleware/RoleGuard";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { getParticipantSubmission } from "@/services/submission.service";
import { submitWorkspaceProject } from "@/services/participant-workspace.service";

export default function EventSubmissionPage() {
  const { id } = useParams<{ id: string }>();

  const [projectName, setProjectName] = useState("");
  const [repo, setRepo] = useState("");
  const [demo, setDemo] = useState("");
  const [description, setDescription] = useState("");
  const [hasSubmission, setHasSubmission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getParticipantSubmission(id)
      .then((submission) => {
        if (!submission) return;
        setHasSubmission(true);
        setProjectName(submission.teamName || "Project");
        setRepo(submission.repoUrl || "");
        setDemo(submission.demoUrl || "");
        setDescription(submission.summary || "");
      })
      .catch(() => setToast({ ok: false, msg: "Could not load existing submission." }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectName.trim() || !repo.trim() || !description.trim()) {
      setToast({ ok: false, msg: "Project name, repository, and description are required." });
      return;
    }

    setSubmitting(true);
    try {
      await submitWorkspaceProject({
        eventId: id,
        projectName: projectName.trim(),
        repo: repo.trim(),
        demo: demo.trim() || undefined,
        description: description.trim(),
      });
      setHasSubmission(true);
      setToast({ ok: true, msg: hasSubmission ? "Submission updated." : "Submission created." });
    } catch {
      setToast({ ok: false, msg: "Failed to submit project." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["participant"]}>
      <DashboardShell>
        <ToastMessage toast={toast} onClose={() => setToast(null)} />
        <EventWorkspaceLayout
          eventId={id}
          title="Project Submission"
          subtitle="Submit or update your project details"
        >
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
              Loading submission...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="space-y-2">
                <label htmlFor="projectName" className="text-sm font-medium text-slate-200">
                  Project Name
                </label>
                <input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="repo" className="text-sm font-medium text-slate-200">
                  GitHub Repository
                </label>
                <input
                  id="repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                  placeholder="https://github.com/org/project"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="demo" className="text-sm font-medium text-slate-200">
                  Demo Video Link
                </label>
                <input
                  id="demo"
                  value={demo}
                  onChange={(e) => setDemo(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-200">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
              >
                {submitting ? "Saving..." : hasSubmission ? "Edit Submission" : "Submit Project"}
              </button>
            </form>
          )}
        </EventWorkspaceLayout>
      </DashboardShell>
    </RoleGuard>
  );
}
