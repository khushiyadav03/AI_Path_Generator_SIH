import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const sources = [
  {
    name: "Coursera",
    url: "https://www.coursera.org",
    logo: (
      <div className="text-2xl font-bold text-[#0056D2] drop-shadow-[0_0_8px_rgba(0,86,210,0.5)]">
        coursera
      </div>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com",
    logo: (
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[#FF0000]">
          <div className="ml-1 h-0 w-0 border-l-[10px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
        </div>
        <span className="text-xl font-semibold text-gray-800">YouTube</span>
      </div>
    ),
  },
  {
    name: "Udemy",
    url: "https://www.udemy.com",
    logo: (
      <div className="flex items-center gap-1 text-2xl font-bold text-black">
        <span className="text-purple-600">^</span>
        <span>udemy</span>
      </div>
    ),
  },
  {
    name: "edX",
    url: "https://www.edx.org",
    logo: (
      <div className="relative flex items-center">
        <div className="absolute -left-1 top-0 h-6 w-8 rotate-[-8deg] bg-teal-700/90" />
        <div className="relative h-6 w-8 rotate-[8deg] bg-teal-700/90" />
        <span className="ml-2 text-2xl font-bold text-white">edX</span>
      </div>
    ),
  },
];

export default function Videos() {
  return (
    <main className="container mx-auto py-16">
      <motion.h1
        className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Curated videos
      </motion.h1>
      <p className="mt-2 text-foreground/70">Handpicked learning resources that match your goals.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((s, i) => (
          <motion.a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="glass group flex flex-col items-center justify-center rounded-2xl p-8 transition hover:ring-2 hover:ring-cyan-400/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mb-4"
            >
              {s.logo}
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-foreground/70 group-hover:text-cyan-300 transition">
              <span>Visit {s.name}</span>
              <ExternalLink size={14} />
            </div>
          </motion.a>
        ))}
      </div>
    </main>
  );
}


