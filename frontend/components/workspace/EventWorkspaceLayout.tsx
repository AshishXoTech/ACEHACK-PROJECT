"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: (eventId: string) => `/events/${eventId}/workspace` },
  { label: "Team", href: (eventId: string) => `/events/${eventId}/team` },
  { label: "Submission", href: (eventId: string) => `/events/${eventId}/submission` },
  { label: "Resources", href: (eventId: string) => `/events/${eventId}/resources` },
  { label: "Certificates", href: (eventId: string) => `/events/${eventId}/certificate` },
];

interface EventWorkspaceLayoutProps {
  eventId: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function EventWorkspaceLayout({
  eventId,
  title,
  subtitle,
  children,
}: EventWorkspaceLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
        <div className="mb-3 border-b border-slate-800 px-2 pb-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">Event {eventId}</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const href = item.href(eventId);
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-slate-800 text-cyan-300 ring-1 ring-cyan-500/40"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </header>
        {children}
      </section>
    </div>
  );
}
