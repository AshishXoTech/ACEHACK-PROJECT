"use client";

import { motion } from "framer-motion";
import Section from "./Section";

const communities = [
  "MLH",
  "Devfolio",
  "ETHGlobal",
  "Google Developer Groups",
  "OpenAI Dev Community",
  "HackClub",
];

export default function SocialProof() {
  return (
    <Section
      title="Trusted by Hackathon Communities"
      description="HackFlow AI is designed for the next generation of hackathons — trusted by organizers and developer communities worldwide."
    >

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

        {communities.map((community, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            className="border border-slate-800 rounded-lg bg-slate-900 py-4 text-center text-sm text-slate-300 hover:border-slate-700 transition"
          >
            {community}
          </motion.div>
        ))}

      </div>

    </Section>
  );
}