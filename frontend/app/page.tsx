"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GitBranch,
  LineChart,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 shadow-sm shadow-slate-950/80">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/15">
              <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-slate-100">HackFlow AI</span>
              <span className="ml-1 text-slate-500">
                Production-ready hackathon ops frontend
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/leaderboard"
              className="hidden items-center gap-1 rounded-full border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-200 sm:inline-flex"
            >
              <Trophy className="h-3.5 w-3.5 text-yellow-300" />
              Live leaderboard
            </Link>
            <Link
              href="/sponsors"
              className="hidden rounded-full border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-200 sm:inline-flex"
            >
              Sponsors
            </Link>
            <Link href="/login" className="btn-outline">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary">
              Launch dashboard
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-950/80 px-3 py-1 text-xs text-cyan-200 shadow-sm shadow-cyan-500/50">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span className="font-medium">
                  AI-assisted judging wired via backend
                </span>
              </div>

              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
                Run hackathons like a{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  product launch
                </span>
                .
              </h1>

              <p className="max-w-xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
                HackFlow AI centralizes event setup, registrations, judging, and
                certificates in one modern SaaS dashboard. Your existing Node +
                FastAPI stack powers all the data and AI — this UI just plugs
                in.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-950/80 px-2.5 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  JWT auth, role-aware dashboards
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-950/80 px-2.5 py-1">
                  <LineChart className="h-3.5 w-3.5 text-cyan-300" />
                  Live analytics & leaderboard
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <div className="glass-panel flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    Organizers
                  </span>
                  <Users className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="text-sm font-medium text-slate-100">
                  Configure tracks, manage teams, and publish leaderboards with
                  one click.
                </p>
              </div>
              <div className="glass-panel flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    Judges
                  </span>
                  <GitBranch className="h-4 w-4 text-emerald-300" />
                </div>
                <p className="text-sm font-medium text-slate-100">
                  Review repos, AI summaries, and submit scores from a focused
                  console.
                </p>
              </div>
              <div className="glass-panel flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    Participants
                  </span>
                  <Trophy className="h-4 w-4 text-yellow-300" />
                </div>
                <p className="text-sm font-medium text-slate-100">
                  Create teams, submit projects, and download certificates in
                  seconds.
                </p>
              </div>
            </motion.div>
          </section>

          <section className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="glass-panel relative overflow-hidden p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Live event snapshot
                  </p>
                  <p className="text-sm text-slate-100">
                    Data loads automatically from your backend.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-500/40">
                  Realtime
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
                  <p className="text-[11px] font-medium text-slate-400">
                    Total teams
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                    —
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Fetched from organizer analytics API.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
                  <p className="text-[11px] font-medium text-slate-400">
                    Top team score
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                    —
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Driven by backend leaderboard service.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Once wired, this card reads directly from{" "}
                <span className="font-semibold text-slate-300">
                  `/events/:id/analytics`
                </span>{" "}
                and leaderboard APIs — no mock data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="glass-panel space-y-3 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  AI project analysis
                </p>
                <span className="text-[11px] text-slate-500">
                  Powered via your backend & FastAPI.
                </span>
              </div>
              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs text-slate-300">
                <p className="font-medium text-slate-100">
                  “Post-submission, participants immediately see an
                  AI-generated summary, detected tech stack, complexity, and
                  usability score — all surfaced from backend responses.”
                </p>
              </div>
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  );
}

