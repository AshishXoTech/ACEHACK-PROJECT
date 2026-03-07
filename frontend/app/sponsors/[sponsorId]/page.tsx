"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { getSponsorById, Sponsor } from "@/services/sponsor.service";

export default function SponsorDetailPage() {
  const { sponsorId } = useParams<{ sponsorId: string }>();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSponsorById(sponsorId)
      .then((data) => setSponsor(data))
      .catch(() => setError("Could not load sponsor details."))
      .finally(() => setLoading(false));
  }, [sponsorId]);

  if (loading) return <PageSkeleton rows={7} />;

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error || "Sponsor not found."}
          </div>
          <Link href="/sponsors" className="mt-4 inline-block text-sm text-cyan-300 hover:underline">
            Back to sponsors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/sponsors" className="mb-4 inline-block text-sm text-cyan-300 hover:underline">
          ← Back to sponsors
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950/70">
              {sponsor.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sponsor.logoUrl} alt={sponsor.companyName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-slate-500">LOGO</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{sponsor.companyName}</h1>
              <p className="text-sm text-slate-400">{sponsor.industry}</p>
              <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-300 hover:underline">
                {sponsor.website}
              </a>
            </div>
          </div>

          <Section title="About the Company" value={sponsor.about} />

          <Section title="Sponsorship Criteria" value={sponsor.sponsorshipCriteria} />

          <div className="grid gap-4 md:grid-cols-2">
            <Section title="Sponsorship Type" value={sponsor.sponsorshipType} />
            <Section title="Cash Prize Contribution" value={sponsor.cashPrizeContribution} />
            <Section title="API Credits" value={sponsor.apiCredits} />
            <Section title="Cloud Credits" value={sponsor.cloudCredits} />
          </div>

          <div className="mt-4 grid gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Sponsorship Offerings</p>
            <p className="text-slate-300">Mentorship Support: {sponsor.mentorshipSupport ? "Yes" : "No"}</p>
            <p className="text-slate-300">Judging Participation: {sponsor.judgingParticipation ? "Yes" : "No"}</p>
            <p className="text-slate-300">Workshops / Tech Talks: {sponsor.workshopsOrTechTalks ? "Yes" : "No"}</p>
            <p className="text-slate-300">Swag / Merchandise: {sponsor.swagOrMerchandise ? "Yes" : "No"}</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Section title="Developer Tools Provided" value={sponsor.technologies.join(", ")} />
            <Section title="Past Hackathons Sponsored" value={sponsor.pastHackathons.join(", ")} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Section title="Partnership Email" value={sponsor.contactEmail} />
            <Section title="LinkedIn Page" value={sponsor.linkedinPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-1 text-sm text-slate-200">{value || "Not provided"}</p>
    </div>
  );
}
