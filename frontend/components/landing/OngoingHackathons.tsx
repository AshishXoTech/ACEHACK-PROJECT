"use client";

import { motion } from "framer-motion";
import Section from "./Section";

const hackathons = [
  {
    name: "AI Innovation Challenge 2026",
    organizer: "OpenAI Dev Community",
    participants: "412 Teams",
    prize: "$15,000",
    duration: "36 Hours",
    tags: ["AI", "ML", "Web3"],
  },
  {
    name: "FinTech Disrupt Hack",
    organizer: "Razorpay DevLabs",
    participants: "230 Teams",
    prize: "$10,000",
    duration: "24 Hours",
    tags: ["FinTech", "Payments"],
  },
  {
    name: "Climate Tech Hackathon",
    organizer: "Google Developer Groups",
    participants: "350 Teams",
    prize: "$12,000",
    duration: "48 Hours",
    tags: ["Climate", "AI"],
  },
];

export default function OngoingHackathons() {
  return (
    <Section
      id="hackathons"
      title="Ongoing Hackathons"
      description="Join live hackathons happening right now and compete with developers around the world."
    >

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {hackathons.map((hackathon, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="border border-slate-800 rounded-xl bg-slate-900 p-6 hover:border-slate-700 transition"
          >

            <h3 className="text-lg font-semibold">
              {hackathon.name}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Organizer: {hackathon.organizer}
            </p>

            {/* STATS */}

            <div className="mt-5 space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-400">Participants</span>
                <span className="text-slate-200">
                  {hackathon.participants}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Prize Pool</span>
                <span className="text-slate-200">
                  {hackathon.prize}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="text-slate-200">
                  {hackathon.duration}
                </span>
              </div>

            </div>

            {/* TAGS */}

            <div className="flex flex-wrap gap-2 mt-5">
              {hackathon.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs border border-slate-700 px-2 py-1 rounded-md text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* BUTTON */}

            <button className="mt-6 w-full border border-slate-700 hover:border-slate-600 py-2 rounded-lg transition text-sm">
              View Event
            </button>

          </motion.div>
        ))}

      </div>

    </Section>
  );
}