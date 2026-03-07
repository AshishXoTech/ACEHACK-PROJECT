"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";
import Section from "./Section";

const advantages = [
  {
    title: "AI Powered Insights",
    description:
      "HackFlow analyzes repositories and generates summaries, tech stacks, and complexity insights for judges.",
    icon: Sparkles,
  },
  {
    title: "Automated Workflow",
    description:
      "Registrations, submissions, judging, leaderboards, and certificates — all managed in one platform.",
    icon: Zap,
  },
  {
    title: "Fair Judging",
    description:
      "Structured evaluation and real-time scoring ensure fairness and eliminate manual judging chaos.",
    icon: ShieldCheck,
  },
];

export default function WhyHackflow() {
  return (
    <Section
     id="why"
     title="Why HackFlow AI"
      description="Hackathons today rely on spreadsheets and scattered tools. HackFlow replaces that chaos with a streamlined platform."
    >

      {/* ADVANTAGES */}

      <div className="grid md:grid-cols-3 gap-6">

        {advantages.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="border border-slate-800 rounded-xl bg-slate-900 p-6 hover:border-slate-700 transition text-center"
            >

              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
                <Icon size={22} />
              </div>

              <h3 className="text-lg font-semibold">
                {item.title}
              </h3>

              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>

            </motion.div>
          );
        })}

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">

        <div>
          <h3 className="text-3xl font-semibold text-cyan-400">
            3×
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Faster judging process
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-cyan-400">
            100%
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Transparent scoring
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-cyan-400">
            0
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Manual spreadsheets
          </p>
        </div>

      </div>

    </Section>
  );
}