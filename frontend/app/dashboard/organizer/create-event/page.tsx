"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  CalendarRange,
  FileText,
  Loader2,
  MapPin,
  Building2,
  Lightbulb,
  CheckCircle2,
  Link as LinkIcon
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/middleware/RoleGuard";
import {
  CreateEventPayload,
  createEvent,
  uploadEventRules,
  updateEventPublicUrl,
} from "@/services/event.service";

interface EventFormValues {
  title: string;
  description: string;
  location: string;
  college?: string;
  theme?: string;
  startDate: string;
  endDate: string;
  tracks: string;
}

export default function CreateEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Phase 2: Uploads & Links
  const [rulesFile, setRulesFile] = useState<File | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [uploadingRules, setUploadingRules] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      college: "",
      theme: "",
      startDate: "",
      endDate: "",
      tracks: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const payload: CreateEventPayload = {
        title: values.title,
        description: values.description,
        location: values.location,
        college: values.college || undefined,
        theme: values.theme || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        tracks: values.tracks
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const created = await createEvent(payload);
      setCreatedEventId(created.id);
      setSuccessMsg("Event created successfully! You can now configure its public page and rules.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to create event."
      );
    } finally {
      setLoading(false);
    }
  });

  const handleUploadRules = async () => {
    if (!createdEventId || !rulesFile) return;
    setError(null);
    setUploadingRules(true);
    try {
      await uploadEventRules(createdEventId, rulesFile);
      setSuccessMsg("Rulebook uploaded successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to upload rules."
      );
    } finally {
      setUploadingRules(false);
    }
  };

  const handleUpdateUrl = async () => {
    if (!createdEventId || !publicUrl) return;
    setError(null);
    setSavingUrl(true);
    try {
      await updateEventPublicUrl(createdEventId, publicUrl);
      setSuccessMsg("Public URL saved successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to save URL."
      );
    } finally {
      setSavingUrl(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["organizer"]}>
      <DashboardShell>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-50">
              Create New Hackathon
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure event details, themes, and timelines.
            </p>
          </div>

          {(error || successMsg) && (
            <div className="space-y-2">
              {error && (
                <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMsg}
                </div>
              )}
            </div>
          )}

          {/* Phase 1: Creation Form */}
          <div className={`glass-panel p-6 ${createdEventId ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="mb-5 flex items-center gap-2 border-b border-slate-800 pb-4">
              <CalendarRange className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Primary Details
              </h3>
            </div>

            <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="label" htmlFor="title">
                  Event Title *
                </label>
                <input
                  id="title"
                  className="input"
                  placeholder="Enter a title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-xs text-rose-400">{errors.title.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="label" htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  className="input min-h-[96px] resize-y"
                  placeholder="Enter a brief description of the hackathon... "
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <p className="text-xs text-rose-400">{errors.description.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="location">
                  Location *
                </label>
                <div className="relative">
                  {/* <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
                  <input
                    id="location"
                    className="input pl-9"
                    placeholder="e.g. Jaipur, Rajasthan"
                    {...register("location", { required: "Location is required" })}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-rose-400">{errors.location.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="college">
                  College / University / Organization
                </label>
                <div className="relative">
                  {/* <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
                  <input
                    id="college"
                    className="input pl-9"
                    placeholder="e.g. UEM"
                    {...register("college")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="theme">
                  Event Theme 
                </label>
                <div className="relative">
                  {/* <Lightbulb className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
                  <input
                    id="theme"
                    className="input pl-9"
                    placeholder="e.g. MineCraft"
                    {...register("theme")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="tracks">
                  Tracks *
                </label>
                <input
                  id="tracks"
                  className="input"
                  placeholder="AI Agents, UI/UX, Smart Contracts..."
                  {...register("tracks", { required: "At least one track is required" })}
                />
                <p className="text-[11px] text-slate-500">Comma-separated list</p>
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="startDate">
                  Start Date & Time *
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  className="input"
                  {...register("startDate", { required: "Start date is required" })}
                />
                {errors.startDate && (
                  <p className="text-xs text-rose-400">{errors.startDate.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="endDate">
                  End Date & Time *
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  className="input"
                  {...register("endDate", { required: "End date is required" })}
                />
                {errors.endDate && (
                  <p className="text-xs text-rose-400">{errors.endDate.message as string}</p>
                )}
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !!createdEventId}
                  className="btn-primary"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Creating...</>
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Phase 2: Post-Creation configuration */}
          {createdEventId && (
            <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">

              <div className="glass-panel p-6 border-cyan-900/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-slate-100">Upload Rulebook</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Upload the official rules and code of conduct for participants (PDF/DOCX).
                </p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setRulesFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-300 mb-3 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-300 hover:file:bg-slate-700 transition-colors"
                />

                <button
                  onClick={handleUploadRules}
                  disabled={!rulesFile || uploadingRules}
                  className="btn-outline w-full justify-center disabled:opacity-50"
                >
                  {uploadingRules ? "Uploading..." : "Upload Rules"}
                </button>
              </div>

              <div className="glass-panel p-6 border-cyan-900/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <div className="mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-slate-100">Public Website Link</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Provide the link to the external landing page or Devfolio for this hackathon.
                </p>

                <input
                  type="url"
                  placeholder="https://hackflow.ai/winter-hack"
                  value={publicUrl}
                  onChange={e => setPublicUrl(e.target.value)}
                  className="input mb-3"
                />

                <button
                  onClick={handleUpdateUrl}
                  disabled={!publicUrl || savingUrl}
                  className="btn-outline w-full justify-center disabled:opacity-50"
                >
                  {savingUrl ? "Saving..." : "Save Link"}
                </button>
              </div>

              <div className="sm:col-span-2 flex justify-center pt-4">
                <button
                  onClick={() => router.push("/dashboard/organizer")}
                  className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                >
                  ← Return to Organizer Dashboard
                </button>
              </div>

            </div>
          )}

        </div>
      </DashboardShell>
    </RoleGuard>
  );
}