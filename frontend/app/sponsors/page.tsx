"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getSponsors, Sponsor } from "@/services/sponsor.service";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSponsors()
      .then((rows) => setSponsors(rows))
      .catch(() => setError("Could not load sponsors right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sponsor Directory</h1>
            <p className="mt-1 text-sm text-slate-400">
              Public list of sponsor companies supporting Devora hackathons.
            </p>
          </div>
          <Link
            href="/sponsors/register"
            className="rounded-lg border border-cyan-500/70 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
          >
            Register as Sponsor
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
            Loading sponsors...
          </div>
        ) : sponsors.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
            No sponsors available.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <article
                key={sponsor.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3"
              >
                <h2 className="text-lg font-semibold text-slate-100">{sponsor.companyName}</h2>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {sponsor.industry}
                </p>
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-cyan-300 hover:underline"
                >
                  {sponsor.website}
                </a>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Technologies / APIs
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {sponsor.technologies.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Sponsorship Type
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{sponsor.sponsorshipType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Sponsorship Criteria
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{sponsor.sponsorshipCriteria}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Contact Email
                  </p>
                  <a
                    href={`mailto:${sponsor.contactEmail}`}
                    className="mt-1 inline-block text-sm text-cyan-300 hover:underline"
                  >
                    {sponsor.contactEmail}
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
