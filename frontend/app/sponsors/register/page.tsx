"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  registerSponsor,
  SponsorRegistrationPayload,
} from "@/services/sponsor.service";

export default function SponsorRegisterPage() {
  const [form, setForm] = useState<SponsorRegistrationPayload>({
    companyName: "",
    industry: "",
    website: "",
    linkedinCompanyPage: "",
    technologies: [],
    sponsorshipType: "",
    sponsorshipCriteria: "",
    contactEmail: "",
  });
  const [technologyInput, setTechnologyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resolveErrorMessage = (err: unknown) => {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
    ) {
      return (err as { response?: { data?: { message?: string } } }).response!.data!.message!;
    }
    return "Could not submit sponsor details.";
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const technologies = technologyInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await registerSponsor({
        ...form,
        technologies,
      });

      setSuccess("Sponsor profile submitted. Verify your email, then wait for admin approval.");
      setForm({
        companyName: "",
        industry: "",
        website: "",
        linkedinCompanyPage: "",
        technologies: [],
        sponsorshipType: "",
        sponsorshipCriteria: "",
        contactEmail: "",
      });
      setTechnologyInput("");
    } catch (err: unknown) {
      setError(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Sponsor Registration</h1>
          <p className="mt-1 text-sm text-slate-400">
            Submit your company details to join the Devora sponsor directory.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
        >
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Company Name"
            value={form.companyName}
            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
            required
          />
          <input
            type="url"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Website"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            required
          />
          <input
            type="url"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="LinkedIn Company Page (https://linkedin.com/company/...)"
            value={form.linkedinCompanyPage}
            onChange={(e) => setForm((p) => ({ ...p, linkedinCompanyPage: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Technologies / APIs (comma separated)"
            value={technologyInput}
            onChange={(e) => setTechnologyInput(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Sponsorship Type"
            value={form.sponsorshipType}
            onChange={(e) => setForm((p) => ({ ...p, sponsorshipType: e.target.value }))}
            required
          />
          <textarea
            className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Sponsorship Criteria (e.g. Minimum registrations: 1000+, Multi-college participation, Brand visibility on banners)"
            value={form.sponsorshipCriteria}
            onChange={(e) => setForm((p) => ({ ...p, sponsorshipCriteria: e.target.value }))}
            required
          />
          <input
            type="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Contact Email"
            value={form.contactEmail}
            onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
            required
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg border border-cyan-500/70 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Sponsor Details"}
            </button>
            <Link
              href="/sponsors"
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Back to Sponsors
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
