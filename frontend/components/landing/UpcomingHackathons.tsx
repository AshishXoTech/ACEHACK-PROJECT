"use client";

import { motion } from "framer-motion";
import Section from "./Section";

const upcomingHackathons = [
  {
    name: "ACEHACK 4.0",
    organizer: "ACE Engineering College",
    theme: "AI + Automation",
    date: "March 22–23, 2026",
    prize: "₹1,00,000",
    location: "Hybrid",
  },
  {
    name: "Web3 Global Hack",
    organizer: "Ethereum Foundation",
    theme: "Blockchain Innovation",
    date: "April 15–17, 2026",
    prize: "$25,000",
    location: "Online",
  },
  {
    name: "Build With AI 2026",
    organizer: "Google Developer Groups",
    theme: "AI Applications",
    date: "May 10–12, 2026",
    prize: "$20,000",
    location: "Global",
  },
];

export default function UpcomingHackathons() {
  return (
    <Section
      id="upcoming-hackathons"
      className="py-12"
      title="Upcoming Hackathons"
      description="Register early and prepare for the next wave of innovation."
    >

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {upcomingHackathons.map((event, index) => (
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
              {event.name}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Organized by {event.organizer}
            </p>

            {/* DETAILS */}

            <div className="mt-5 space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-400">Theme</span>
                <span className="text-slate-200">{event.theme}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-slate-200">{event.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Prize</span>
                <span className="text-slate-200">{event.prize}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-200">{event.location}</span>
              </div>

            </div>

            <button className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium py-2 rounded-lg transition text-sm">
              Register
            </button>

          </motion.div>
        ))}

      </div>

    </Section>
  );
}
