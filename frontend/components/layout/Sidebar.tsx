"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Award,
  BarChart3,
  CalendarPlus,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Medal,
  Trophy,
  Users,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("organizer" | "judge" | "participant")[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/organizer",
    label: "Organizer Dashboard",
    icon: LayoutDashboard,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/judges",
    label: "Judge Assignment",
    icon: Users,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/create-event",
    label: "Create Event",
    icon: CalendarPlus,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/registrations",
    label: "Registrations",
    icon: Users,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/submissions",
    label: "Submissions",
    icon: GitBranch,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/leaderboard",
    label: "Publish Results",
    icon: Trophy,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/organizer/certificates",
    label: "Certificates",
    icon: Award,
    roles: ["organizer"],
  },
  {
    href: "/dashboard/judge",
    label: "Judge Dashboard",
    icon: GitBranch,
    roles: ["judge"],
  },
  {
    href: "/dashboard/participant",
    label: "Participant Dashboard",
    icon: LayoutDashboard,
    roles: ["participant"],
  },
  {
    href: "/dashboard/participant/certificates",
    label: "My Certificates",
    icon: Award,
    roles: ["participant"],
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    roles: ["organizer", "judge", "participant"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800/80 bg-slate-950/90 px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/40">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-50">
            HackFlow AI
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Hackathon Control Center
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active
                ? "bg-slate-900 text-cyan-300 ring-1 ring-cyan-500/60"
                : "text-slate-300 hover:bg-slate-900/70 hover:text-cyan-200"
                }`}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-300"
                  }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mt-6 space-y-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/80 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-slate-100">
                {user.name}
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {user.role}
              </p>
            </div>
            <Medal className="h-4 w-4 text-yellow-400" />
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-500/70 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
