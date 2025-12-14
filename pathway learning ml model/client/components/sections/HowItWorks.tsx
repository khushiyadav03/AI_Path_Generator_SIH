import { motion } from "framer-motion";
import { Bot, Goal, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Goal,
    title: "Input your goals",
    desc: "Tell us what you want to learn and your timeline.",
    to: "/goals",
  },
  {
    icon: PlayCircle,
    title: "Curated videos",
    desc: "Handpicked courses from Coursera, YouTube, and Udemy.",
    to: "/videos",
  },
  { icon: Bot, title: "AI mentorship", desc: "Get feedback, tips, and a tailored path.", to: "/mentorship" },
];

export default function HowItWorks() {
  return (
    <section className="container mx-auto py-20 mt-8 sm:mt-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
        <p className="mt-2 text-foreground/70">Three steps to a personalized learning journey.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group glass relative overflow-hidden rounded-2xl p-6"
          >
            <Link to={s.to} className="block focus:outline-none">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow">
                <s.icon size={18} />
              </div>
              <h3 className="text-lg font-semibold group-hover:text-cyan-300 transition-colors">{s.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{s.desc}</p>
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-tr from-purple-500/30 to-cyan-400/30 blur-2xl" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
