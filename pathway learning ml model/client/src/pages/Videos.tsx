import { motion } from "framer-motion";

const sources = [
  { name: "Coursera", url: "https://www.coursera.org" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Udemy", url: "https://www.udemy.com" },
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

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s, i) => (
          <motion.a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="glass block rounded-2xl p-6 transition hover:ring-2 hover:ring-cyan-400/60"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <h3 className="text-lg font-semibold">{s.name}</h3>
            <p className="mt-1 text-sm text-foreground/70">Open {s.name}</p>
          </motion.a>
        ))}
      </div>
    </main>
  );
}


