"use client";

import { motion } from "framer-motion";
import Section from "./Section";

export default function Hero() {
  return (
    <Section>

      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE */}

        <div>

          <span className="text-sm text-cyan-400 font-medium">
            Hackathon Management Platform
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mt-4 leading-tight"
          >
            Run Hackathons
            <span className="text-cyan-500"> Like a Product Launch</span>
          </motion.h1>

          <p className="text-slate-400 mt-6 max-w-xl">
            HackFlow AI automates hackathon organization — from registrations
            and submissions to judging and real-time leaderboards — all in one
            streamlined platform.
          </p>

          {/* CTA BUTTONS */}

          <div className="flex gap-4 mt-8">

            <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-5 py-2.5 rounded-lg transition">
              Launch Hackathon
            </button>

            <button className="border border-slate-700 hover:border-slate-600 px-5 py-2.5 rounded-lg transition">
              Explore Events
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-slate-800 rounded-xl bg-slate-900 p-2 shadow-xl"
        >

          {/* Dashboard Preview Image */}

          <img
            src="/dashboard-preview.jpeg"
            alt="HackFlow Organizer Dashboard"
            className="rounded-lg w-full"
          />

        </motion.div>

      </div>

    </Section>
  );
}