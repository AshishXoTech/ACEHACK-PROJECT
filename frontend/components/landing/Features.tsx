"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Brain,
  LayoutDashboard,
  Award
} from "lucide-react";

import Section from "./Section";

const features = [
  {
    title: "AI Assisted Judging",
    description:
      "Automatically analyze GitHub repositories and generate intelligent summaries to assist judges in evaluating projects faster.",
    icon: Brain,
  },
  {
    title: "Real-time Leaderboards",
    description:
      "Scores update instantly as judges evaluate projects, creating a transparent and dynamic ranking system.",
    icon: Trophy,
  },
  {
    title: "Organizer Control Center",
    description:
      "Manage registrations, assign judges, configure tracks, and monitor submissions from a single dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Certificate Automation",
    description:
      "Generate and distribute personalized certificates instantly once the hackathon concludes.",
    icon: Award,
  },
];

export default function Features() {
  return (
    <Section
      id="features"
      title="Platform Features"
      description="Everything you need to run a modern hackathon — from project submissions to intelligent judging."
    >

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {features.map((feature, index) => {
          const Icon = feature.icon;

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

              {/* ICON */}

              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
                <Icon size={22} />
              </div>

              {/* TITLE */}

              <h3 className="text-lg font-medium">
                {feature.title}
              </h3>

              {/* DESCRIPTION */}

              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {feature.description}
              </p>

            </motion.div>
          );
        })}

      </div>

    </Section>
  );
}