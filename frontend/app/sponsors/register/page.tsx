"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerSponsor } from "@/services/sponsor.service";

export default function SponsorRegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    website: "",
    about: "",
    sponsorshipType: "",
    sponsorshipCriteria: "",
    technologies: "",
    cashPrizeContribution: "",
    apiCredits: "",
    cloudCredits: "",
    mentorshipSupport: false,
    judgingParticipation: false,
    workshopsOrTechTalks: false,
    swagOrMerchandise: false,
    pastHackathons: "",
    contactEmail: "",
    linkedinPage: "",
  });

  const onLogoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const sponsor = await registerSponsor({
        ...form,
        logoUrl,
        technologies: form.technologies.split(",").map((v) => v.trim()).filter(Boolean),
        pastHackathons: form.pastHackathons.split(",").map((v) => v.trim()).filter(Boolean),
      });
      router.push(`/sponsors/${sponsor.id}`);
    } catch {
      setError("Could not register sponsor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Sponsor Registration</h1>
        <p className="mt-1 text-sm text-slate-400">
          Introduce your company and sponsorship offerings for hackathon organizers.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <Input label="Company Name" value={form.companyName} onChange={(v) => setForm((p) => ({ ...p, companyName: v }))} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Logo Upload</label>
            <input type="file" accept="image/*" onChange={onLogoFile} className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-slate-200" />
          </div>
          <Input label="Industry" value={form.industry} onChange={(v) => setForm((p) => ({ ...p, industry: v }))} />
          <Input label="Website" value={form.website} onChange={(v) => setForm((p) => ({ ...p, website: v }))} />
          <TextArea label="Company Description" value={form.about} onChange={(v) => setForm((p) => ({ ...p, about: v }))} />
          <Input label="Sponsorship Type" value={form.sponsorshipType} onChange={(v) => setForm((p) => ({ ...p, sponsorshipType: v }))} />
          <TextArea
            label="Describe the conditions under which your company sponsors hackathons."
            value={form.sponsorshipCriteria}
            onChange={(v) => setForm((p) => ({ ...p, sponsorshipCriteria: v }))}
            placeholder="We sponsor hackathons with 1000+ registrations and strong developer participation."
          />
          <Input label="Cash Prize Contribution" value={form.cashPrizeContribution} onChange={(v) => setForm((p) => ({ ...p, cashPrizeContribution: v }))} />
          <Input label="Developer Tools or APIs" value={form.technologies} onChange={(v) => setForm((p) => ({ ...p, technologies: v }))} />
          <Input label="API Credits" value={form.apiCredits} onChange={(v) => setForm((p) => ({ ...p, apiCredits: v }))} />
          <Input label="Cloud Credits" value={form.cloudCredits} onChange={(v) => setForm((p) => ({ ...p, cloudCredits: v }))} />
          <Check label="Mentorship Availability" checked={form.mentorshipSupport} onChange={(v) => setForm((p) => ({ ...p, mentorshipSupport: v }))} />
          <Check label="Workshop Availability" checked={form.workshopsOrTechTalks} onChange={(v) => setForm((p) => ({ ...p, workshopsOrTechTalks: v }))} />
          <Check label="Judging Participation" checked={form.judgingParticipation} onChange={(v) => setForm((p) => ({ ...p, judgingParticipation: v }))} />
          <Check label="Swag / Merchandise" checked={form.swagOrMerchandise} onChange={(v) => setForm((p) => ({ ...p, swagOrMerchandise: v }))} />
          <Input label="Past Hackathons Sponsored" value={form.pastHackathons} onChange={(v) => setForm((p) => ({ ...p, pastHackathons: v }))} />
          <Input label="Contact Email" value={form.contactEmail} onChange={(v) => setForm((p) => ({ ...p, contactEmail: v }))} />
          <Input label="LinkedIn Profile" value={form.linkedinPage} onChange={(v) => setForm((p) => ({ ...p, linkedinPage: v }))} />

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Register Sponsor"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
      />
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-cyan-500" />
      {label}
    </label>
  );
}
