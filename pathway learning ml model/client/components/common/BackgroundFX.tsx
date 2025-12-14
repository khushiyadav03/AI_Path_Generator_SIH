import { motion } from "framer-motion";

export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 right-0 h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-purple-500/30 via-blue-500/25 to-cyan-400/30 blur-3xl animate-gradient-x" />
      <div className="absolute -left-32 top-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-tr from-cyan-400/25 via-purple-500/25 to-blue-500/25 blur-3xl animate-gradient-x" />
      <motion.svg
        className="absolute inset-x-0 -bottom-10 mx-auto h-[24rem] w-[64rem] opacity-40"
        viewBox="0 0 1200 400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        transition={{ duration: 1.2 }}
      >
        <defs>
          <linearGradient id="neural" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <motion.path
            key={i}
            d={`M0 ${50 + i * 35} C 300 ${120 + i * 10}, 600 ${-20 + i * 30}, 1200 ${60 + i * 20}`}
            stroke="url(#neural)"
            strokeWidth={1.2}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3 + i * 0.2, repeat: Infinity, repeatType: "mirror" }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
