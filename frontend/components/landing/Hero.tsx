"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ACCESS_TOKEN_KEY, CURRENT_USER_KEY } from "@/services/api";
import Section from "./Section";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLaunchHackathon = () => {
    if (user?.role === "organizer") {
      router.push("/dashboard/organizer/create-hackathon");
      return;
    }

    if (typeof window !== "undefined") {
      const hasToken = Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY));
      const hasUser = Boolean(window.localStorage.getItem(CURRENT_USER_KEY));
      router.push(!hasToken && hasUser ? "/login" : "/register");
      return;
    }

    router.push("/register");
  };

  return (
    <Section className="pt-16 pb-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-base md:text-xl text-cyan-400 font-medium">
            Hackathon Management Platform
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mt-4 leading-tight"
          >
            Run Hackathons
            <span className="text-cyan-500"> Like a Product Launch</span>
          </motion.h1>

          <p className="text-base md:text-lg leading-relaxed text-slate-400 mt-6 max-w-xl">
            HackFlow AI automates hackathon organization from registrations and
            submissions to judging and real-time leaderboards all in one
            streamlined platform.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleLaunchHackathon}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-5 py-2.5 rounded-lg transition"
            >
              Launch Hackathon
            </button>

            <a
              href="#upcoming-hackathons"
              className="border border-slate-700 hover:border-slate-600 px-5 py-2.5 rounded-lg transition"
            >
              Explore Events
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-[700px] lg:ml-auto border border-slate-800 rounded-xl bg-slate-900 p-2 shadow-2xl drop-shadow-xl ring-1 ring-cyan-500/20"
        >
          <img
            src="/dashboard-preview.jpeg"
            alt="HackFlow Organizer Dashboard"
            className="rounded-lg w-full object-cover"
          />
        </motion.div>
      </div>
    </Section>
  );
}
