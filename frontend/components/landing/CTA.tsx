"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ACCESS_TOKEN_KEY, CURRENT_USER_KEY } from "@/services/api";
import Section from "./Section";

export default function CTA() {
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

  const handleExplorePlatform = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto"
      >
        <h2 className="text-3xl font-semibold">
          Ready to Run Your Next Hackathon?
        </h2>

        <p className="text-slate-400 mt-4">
          Launch hackathons, manage teams, evaluate projects, and generate
          leaderboards all from one streamlined platform.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleLaunchHackathon}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-5 py-2 rounded-lg transition text-sm"
          >
            Launch Hackathon
          </button>

          <button
            onClick={handleExplorePlatform}
            className="border border-slate-700 hover:border-slate-600 px-5 py-2 rounded-lg transition text-sm"
          >
            Explore Platform
          </button>
        </div>
      </motion.div>
    </Section>
  );
}
