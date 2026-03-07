"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { getSponsors, Sponsor } from "@/services/sponsor.service";

export default function SponsorsDirectoryPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSponsors()
      .then((data) => setSponsors(data))
      .catch(() => setError("Could not load sponsors directory."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton rows={6} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Sponsor Directory</h1>
            <p className="mt-1 text-sm text-slate-400">
              Explore sponsor offerings and connect with companies that support hackathons.
            </p>
          </div>
          <Link href="/sponsors/register" className="btn-primary">
            Register as Sponsor
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              href={`/sponsors/${sponsor.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-cyan-500/40 hover:bg-slate-900/60"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950/70">
                  {sponsor.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sponsor.logoUrl} alt={sponsor.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">LOGO</span>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-100">{sponsor.companyName}</h2>
                  <p className="text-xs text-slate-500">{sponsor.industry}</p>
                </div>
              </div>

              <Info title="Sponsorship Type" value={sponsor.sponsorshipType} />
              <Info title="Technologies" value={sponsor.technologies.join(", ")} />
              <Info title="Sponsorship Criteria" value={sponsor.sponsorshipCriteria} />
              <Info title="Website" value={sponsor.website.replace(/^https?:\/\//, "")} />
              <Info title="Contact" value={sponsor.contactEmail} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-2">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="text-sm text-slate-200">{value || "Not provided"}</p>
    </div>
  );
}
