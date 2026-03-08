"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between h-16">

          {/* LOGO */}

          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            HackFlow
          </Link>

          {/* NAV LINKS */}

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">

            <Link
              href="#features"
              className="hover:text-slate-200 transition"
            >
              Features
            </Link>

            <Link
              href="#hackathons"
              className="hover:text-slate-200 transition"
            >
              Hackathons
            </Link>

            <Link
              href="#why"
              className="hover:text-slate-200 transition"
            >
              Why HackFlow
            </Link>

            <Link
              href="/sponsors"
              className="hover:text-slate-200 transition"
            >
              Sponsors
            </Link>

          </nav>

          {/* ACTION BUTTONS */}

          <div className="flex items-center gap-4">

            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Login
            </Link>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <Link href="/dashboard/organizer/create-event">
                Create Hackathon
              </Link>
            </motion.div>

          </div>

        </div>

      </div>
    </header>
  );
}
