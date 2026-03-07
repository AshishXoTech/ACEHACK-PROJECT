"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const titleMap: Record<string, string> = {
  "/dashboard/organizer": "Organizer Control Room",
  "/dashboard/judge": "Judge Console",
  "/dashboard/participant": "Participant Workspace",
};

function resolveTitle(pathname: string): string {
  const matchedKey = Object.keys(titleMap).find((key) =>
    pathname.startsWith(key),
  );
  if (matchedKey) return titleMap[matchedKey];
  if (pathname.startsWith("/leaderboard")) return "Leaderboard";
  return "HackFlow AI";
}

export function Topbar() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-800/70 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-900/70 px-3 py-1 text-xs font-medium text-cyan-200 shadow-sm shadow-cyan-500/40"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>AI-augmented hackathon ops</span>
        </motion.div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            {title}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time control over teams, submissions, and AI scoring.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 sm:flex">
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <input
            className="bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none"
            placeholder="Search teams, projects, or judges..."
          />
        </div>
      </div>
    </header>
  );
}

