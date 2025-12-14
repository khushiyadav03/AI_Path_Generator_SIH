import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ListChecks, FlameKindling, Quote } from "lucide-react";

const recommendations = [
  { title: "Next: Data Analysis with Pandas", detail: "Hands-on exercises to clean and analyze datasets." },
  { title: "Practice: Arrays & Hashmaps", detail: "10 problems to improve problem-solving speed." },
  { title: "Watch: Intro to Neural Networks", detail: "Visual guide to perceptrons and backprop." },
];

const weaknesses = [
  { area: "Time management", tip: "Try the 25-minute Pomodoro with 5-minute breaks." },
  { area: "Concept retention", tip: "Summarize each lecture in 5 bullet points in your own words." },
  { area: "Debugging", tip: "Rubber-duck your code and log assumptions at each step." },
];

const quotes = [
  "Learning never exhausts the mind.",
  "The future belongs to those who learn more skills and combine them creatively.",
  "Small progress is still progress.",
  "Stay curious, stay determined.",
];

export default function AIInsights() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quote = useMemo(() => quotes[quoteIndex % quotes.length], [quoteIndex]);

  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => i + 1), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">AI Insights</h2>
        <p className="mt-2 text-foreground/70">Actionable next steps, focus areas, and motivation—powered by AI.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow">
            <ListChecks size={18} />
          </div>
          <div className="text-sm font-semibold">Recommended next courses</div>
          <ul className="mt-2 space-y-2 text-sm">
            {recommendations.map((r) => (
              <li key={r.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-foreground/60">{r.detail}</div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow">
            <FlameKindling size={18} />
          </div>
          <div className="text-sm font-semibold">Weak areas & improvement tips</div>
          <ul className="mt-2 space-y-2 text-sm">
            {weaknesses.map((w) => (
              <li key={w.area} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="font-medium">{w.area}</div>
                <div className="text-xs text-foreground/60">{w.tip}</div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="glass flex flex-col justify-between rounded-2xl p-5"
        >
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow">
              <Quote size={18} />
            </div>
            <div className="text-sm font-semibold">Motivational quote</div>
            <p className="mt-2 text-lg italic">“{quote}”</p>
          </div>
          <div className="mt-6 text-xs text-foreground/60">New quote every few seconds</div>
        </motion.div>
      </div>
    </section>
  );
}
