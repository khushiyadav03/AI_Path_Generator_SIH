import { useState } from "react";
import { motion } from "framer-motion";

export default function Goals() {
  const [goal, setGoal] = useState("");
  const [timeline, setTimeline] = useState("");

  return (
    <main className="container mx-auto max-w-3xl py-16">
      <motion.h1
        className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Input your goals
      </motion.h1>
      <p className="mt-2 text-foreground/70">Describe what you want to learn and when.</p>

      <div className="glass mt-8 rounded-2xl p-6">
        <label className="block text-sm font-medium">Your learning goal</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Ex: Become proficient in machine learning for NLP"
          className="mt-2 w-full rounded-lg border border-white/10 bg-background/60 p-3 outline-none focus:border-cyan-400"
          rows={4}
        />

        <label className="mt-6 block text-sm font-medium">Timeline</label>
        <input
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          placeholder="Ex: 12 weeks"
          className="mt-2 w-full rounded-lg border border-white/10 bg-background/60 p-3 outline-none focus:border-cyan-400"
        />

        <button className="mt-6 inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-2 font-medium text-white shadow transition hover:from-cyan-400 hover:to-purple-400">
          Save goal
        </button>
      </div>
    </main>
  );
}


