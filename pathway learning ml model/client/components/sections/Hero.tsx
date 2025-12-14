import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import BackgroundFX from "@/components/common/BackgroundFX";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 sm:pt-28 pb-16 sm:pb-24">
      <BackgroundFX />
      <div className="container mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-6xl gradient-text"
        >
          Learn Smarter. Grow Faster. Powered by AI.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-base text-foreground/70 sm:text-lg"
        >
          Personalized Learning Path Generator (SIH25199) blends the best of Coursera, ChatGPT, and Notion to craft your perfect learning journey.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-10 sm:mt-12 flex items-center justify-center gap-3 relative z-10"
        >
          <Link
            to="/learning-path"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            <Sparkles size={16} /> Generate My Learning Path
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-md backdrop-blur transition hover:bg-white/20"
          >
            Learn more
          </Link>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background z-0" />
    </section>
  );
}
